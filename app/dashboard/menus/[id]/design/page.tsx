"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { apiClient } from "@/lib/api"

// Load Puck Editor dynamically to keep it isolated
const Puck = dynamic(() => import("@measured/puck").then(m => (m as any).Puck), { ssr: false }) as any
import "@measured/puck/puck.css"
import { puckConfig } from "@/components/puck/config"
import { MenuDataProvider } from "@/components/menu-renderer/data-context"

export default function MenuDesignPage() {
  const { id } = useParams<{ id: string }>()
  
  // Helper to generate unique, stable IDs
  const generateId = () => {
    try {
      // @ts-ignore
      if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
    } catch {}
    return `node_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`
  }

  // Recursively ensure every node has an id
  const ensureNodeIds = (node: any): any => {
    if (!node || typeof node !== "object") return node
    const newId = node.id || generateId()
    const withId: any = { ...node, id: newId, key: node.key || newId }
    // Puck's editor LayerTree derives keys from props.id; ensure it's present
    const nextProps = { ...(withId.props || {}) }
    if (!nextProps.id) nextProps.id = newId
    withId.props = nextProps
    if (Array.isArray(withId.children)) {
      withId.children = withId.children.map((child: any) => ensureNodeIds(child))
    }
    return withId
  }
  
  const [data, setData] = React.useState<any>({
    content: [ensureNodeIds({ 
      type: "Hero", 
      props: { id: generateId(), title: "Welcome to Our Menu", subtitle: "Fresh and delicious" },
      children: []
    })],
    root: { props: { title: "Menu Layout" } }
  })
  const [saving, setSaving] = React.useState(false)
  const [menuData, setMenuData] = React.useState<any>(null)

  // Normalize older layouts to new Puck schema and ensure all items (and children) have IDs
  const migratePuckData = React.useCallback((incoming: any) => {
    if (!incoming) return incoming
    const migrated: any = { ...incoming }
    if (migrated.root && !("props" in migrated.root)) {
      migrated.root = { props: { ...migrated.root } }
    }
    if (migrated.content && Array.isArray(migrated.content)) {
      migrated.content = migrated.content.map((item: any) => ensureNodeIds(item))
    }
    return migrated
  }, [])

  React.useEffect(() => {
    const load = async () => {
      const [resp, versions, menuResp] = await Promise.all([
        apiClient.getMenu(id),
        apiClient.listMenuTemplates(id),
        apiClient.getPublicMenu("", id) // Get menu data for context
      ])
      
      // Set menu data for context
      if (menuResp.data) {
        setMenuData({
          restaurant: menuResp.data.menu.restaurant,
          items: menuResp.data.menu_items || [],
          categories: [...new Set((menuResp.data.menu_items || []).map((item: any) => item.category))],
          selectedCategory: "All",
          onSelectCategory: () => {},
          onSearch: () => {},
          formatPrice: (price: number) => `$${price.toFixed(2)}`,
          resolveImageUrl: (url: string) => url || "/placeholder.svg"
        })
      }
      
      if (resp.data?.layout_config) {
        setData(migratePuckData(resp.data.layout_config as any))
      } else if (versions.data?.templates?.length) {
        const active = versions.data.templates.find(t => t.is_active) || versions.data.templates[0]
        if (active?.layout_config) setData(migratePuckData(active.layout_config))
      }
    }
    if (id) void load()
  }, [id, migratePuckData])

  const onPublish = async (nextData: any) => {
    setSaving(true)
    const created = await apiClient.createMenuTemplate(id, { name: "Custom", layout_config: nextData, theme_config: {} })
    if (created.data?.id) await apiClient.publishMenuTemplate(id, created.data.id, true)
    setSaving(false)
    return { status: "success" }
  }

  // const config = {
  //   components: {},
  // };
  const config = {
    components: {
      Hero: {
        fields: { title: { type: "text" }, subtitle: { type: "text" } },
        render: ({ title = "Our Menu", subtitle = "Fresh and delicious", __key }: any) => {
          const key = __key || `hero-${title}`
          return (
            <div key={key} className="py-8">
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          )
        },
        defaultProps: { title: "Our Menu", subtitle: "Fresh and delicious" },
      },
    }
  };
   
  // const initialData = {
  //   content: [],
  //   root: {},
  // };
  const initialData = {
    content: [
      {
        type: "HeadingBlock",
        props: {
          // id: "HeadingBlock-1234",
          title: "Hello, world"
        }
      }
    ],
    root: { props: { title: "Puck Example" } },
    zones: {}
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Visual Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded min-h-[600px]">
              {console.log("Menu Data:", menuData)}
              {console.log("Layout Data:", data)}
              {console.log("Layout config:", puckConfig)}
              {menuData ? (
                <MenuDataProvider value={menuData}>
                  {/* <Puck config={puckConfig as any} data={initialData} /> */}
                  <Puck 
                    config={puckConfig as any} 
                    data={migratePuckData(data)} 
                    onPublish={onPublish}
                    onChange={(next: any) => setData(migratePuckData(next))}
                  />
                </MenuDataProvider>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div>Loading menu data...</div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button onClick={() => onPublish(data)} disabled={saving}>{saving ? "Publishing..." : "Publish"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


