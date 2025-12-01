"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { apiClient, type DesignTemplateMetadata } from "@/lib/api"
import { resolveImageUrl as resolveImageUrlUtil } from "@/lib/utils"
import { MenuDataProvider } from "@/components/menu-renderer/data-context"
import { getPuckConfig } from "@/components/puck/config"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

// Load Puck Editor dynamically to keep it isolated
const Puck = dynamic(() => import("@measured/puck").then(m => (m as any).Puck), { ssr: false }) as any
import "@measured/puck/puck.css"

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
  const [companyId, setCompanyId] = React.useState<string | null>(null)
  const [themeConfig, setThemeConfig] = React.useState<any>(null)
  const [designTemplates, setDesignTemplates] = React.useState<DesignTemplateMetadata[]>([])
  const [loadingTemplates, setLoadingTemplates] = React.useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false)
  const [templateName, setTemplateName] = React.useState("")
  const [templateDescription, setTemplateDescription] = React.useState("")
  const [savingTemplate, setSavingTemplate] = React.useState(false)
  const [applyingTemplateId, setApplyingTemplateId] = React.useState<string | null>(null)
  const { toast } = useToast()

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
      setCompanyId(null)
      setDesignTemplates([])
      setThemeConfig(null)
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
          categories: [...new Set((menuResp.data.menu_items || []).map((item: any) => item.category))].filter(Boolean),
          selectedCategory: "All",
          onSelectCategory: () => {},
          onSearch: () => {},
          formatPrice: (price: number) => `$${price.toFixed(2)}`,
          resolveImageUrl: (url?: string | null) => resolveImageUrlUtil(url) || "/placeholder.svg"
        })
      }
      
      if (resp.data) {
        setThemeConfig(resp.data.theme_config ?? null)
        if (resp.data.restaurant_id) {
          const restaurantResp = await apiClient.getRestaurant(resp.data.restaurant_id)
          if (restaurantResp.data?.company_id) {
            setCompanyId(restaurantResp.data.company_id)
          }
        }
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

  const loadTemplates = React.useCallback(async () => {
    if (!companyId) return
    setLoadingTemplates(true)
    try {
      const resp = await apiClient.listDesignTemplates(companyId)
      if (resp.data?.templates) {
        setDesignTemplates(resp.data.templates)
      } else if (resp.error) {
        toast({ title: "Unable to refresh templates", description: resp.error })
      }
    } catch (error) {
      toast({ title: "Unable to refresh templates", description: "Please try again later." })
    } finally {
      setLoadingTemplates(false)
    }
  }, [companyId, toast])

  React.useEffect(() => {
    if (!companyId) return
    void loadTemplates()
  }, [companyId, loadTemplates])

  const handleSaveTemplate = React.useCallback(async () => {
    if (!companyId) {
      toast({
        title: "Company information still loading",
        description: "Wait for the restaurant data to finish loading before saving a template.",
      })
      return
    }

    const trimmedName = templateName.trim()
    if (!trimmedName) {
      toast({ title: "Give it a name", description: "Templates need a descriptive name." })
      return
    }

    setSavingTemplate(true)
    try {
      const layoutPayload = migratePuckData(data)
      const resp = await apiClient.createDesignTemplate({
        company_id: companyId,
        name: trimmedName,
        description: templateDescription.trim() || undefined,
        layout_config: layoutPayload,
        theme_config: themeConfig ?? undefined,
      })
      if (resp.error) {
        toast({ title: "Could not save template", description: resp.error })
        return
      }

      toast({
        title: "Template saved",
        description: "Your layout is now available across this company.",
      })
      setTemplateName("")
      setTemplateDescription("")
      setTemplateDialogOpen(false)
      void loadTemplates()
    } finally {
      setSavingTemplate(false)
    }
  }, [
    companyId,
    data,
    loadTemplates,
    migratePuckData,
    templateDescription,
    templateName,
    themeConfig,
    toast,
  ])

  const handleApplyTemplate = React.useCallback(async (templateId: string, templateName: string) => {
    if (!id) {
      toast({
        title: "Missing menu context",
        description: "We need a menu reference before applying the design.",
      })
      return
    }

    setApplyingTemplateId(templateId)
    try {
      const resp = await apiClient.getDesignTemplate(templateId)
      if (resp.error || !resp.data) {
        toast({
          title: "Unable to load template",
          description: resp.error || "This template cannot be applied right now.",
        })
        return
      }

      const layoutPayload = resp.data.preset_layout
      if (!layoutPayload) {
        toast({
          title: "Template missing layout",
          description: "This template lacks serialized layout data.",
        })
        return
      }

      const created = await apiClient.createMenuTemplate(id, {
        name: resp.data.name,
        definition_id: resp.data.id,
        layout_config: layoutPayload,
        theme_config: resp.data.default_theme,
      })
      if (created.error) {
        toast({ title: "Failed to apply template", description: created.error })
        return
      }

      if (!created.data?.id) {
        toast({ title: "Failed to apply template", description: "Template creation did not succeed." })
        return
      }

      const published = await apiClient.publishMenuTemplate(id, created.data.id, true)
      if (published.error) {
        toast({ title: "Failed to publish template", description: published.error })
        return
      }

      setData(migratePuckData(layoutPayload))
      setThemeConfig(resp.data.default_theme ?? null)
      toast({
        title: "Template applied",
        description: `${templateName} is now the active layout.`,
      })
    } finally {
      setApplyingTemplateId(null)
    }
  }, [id, migratePuckData, toast])

  const onPublish = async (nextData: any) => {
    setSaving(true)
    const created = await apiClient.createMenuTemplate(id, { name: "Custom", layout_config: nextData, theme_config: {} })
    if (created.data?.id) await apiClient.publishMenuTemplate(id, created.data.id, true)
    setSaving(false)
    return { status: "success" }
  }

  // Memoize config to avoid re-renders unless data changes
  const config = React.useMemo(() => {
    if (!menuData) return { components: {} } // Fallback while loading
    return getPuckConfig({
      categories: menuData.categories || [],
      items: menuData.items || []
    })
  }, [menuData])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__PUCK_CONFIG__ = config
    }
  }, [config])

  return (
    <DashboardLayout>
      <div className="p-6 w-full">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visual Builder</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded min-h-[800px]">
                  {menuData ? (
                    <MenuDataProvider value={menuData}>
                      <Puck
                        config={config as any}
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
                <div className="mt-4 px-6 pb-6 flex flex-wrap items-center gap-2">
                  <Button onClick={() => onPublish(data)} disabled={saving}>{saving ? "Publishing..." : "Publish"}</Button>
                  <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Save as Template</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save layout as template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="space-y-1">
                          <Label htmlFor="template-name">Template name</Label>
                          <Input
                            id="template-name"
                            value={templateName}
                            onChange={(event) => setTemplateName(event.target.value)}
                            placeholder="Fresh Brunch"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="template-description">Description</Label>
                          <Textarea
                            id="template-description"
                            value={templateDescription}
                            onChange={(event) => setTemplateDescription(event.target.value)}
                            placeholder="Great for seasonal menus that highlight brunch specials."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-2">
                        <Button variant="ghost" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTemplate} disabled={savingTemplate}>{savingTemplate ? "Saving..." : "Save Template"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Design Library</CardTitle>
              <CardDescription>Saved layouts available across your company menus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingTemplates ? (
                <div className="text-sm text-muted-foreground">Loading templates…</div>
              ) : !designTemplates.length ? (
                <div className="text-sm text-muted-foreground">
                  {companyId ? "You haven't saved any templates yet." : "Waiting for restaurant data to show saved templates."}
                </div>
              ) : (
                designTemplates.map((template) => (
                  <div key={template.id} className="rounded-md border bg-muted/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(template.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplyTemplate(template.id, template.name)}
                          disabled={applyingTemplateId === template.id}
                        >
                          {applyingTemplateId === template.id ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
