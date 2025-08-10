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

const config = {
  components: {
    Hero: {
      fields: { title: { type: "text" }, subtitle: { type: "text" } },
      render: ({ title, subtitle }: any) => (
        <div className="py-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      ),
      defaultProps: { title: "Our Menu", subtitle: "Fresh and delicious" },
    },
    ItemsGrid: {
      fields: { columns: { type: "number", min: 1, max: 4, step: 1 } },
      render: ({ columns = 3 }: any) => <div className={`grid gap-6 grid-cols-${columns}`}>Preview grid ({columns})</div>,
      defaultProps: { columns: 3 },
    },
  },
} as const

export default function MenuDesignPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = React.useState<any>({ content: [{ type: "Hero", props: { title: "Welcome" } }] })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      const resp = await apiClient.getMenu(id)
      if (resp.data?.layout_config) setData(resp.data.layout_config as any)
    }
    if (id) void load()
  }, [id])

  const onPublish = async (nextData: any) => {
    setSaving(true)
    // Create a new template version and publish+activate it
    const create = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/menus/menus/${id}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(apiClient as any).getAuthHeader?.() },
      body: JSON.stringify({ name: "Custom", layout_config: nextData, theme_config: {} })
    })
    const created = await create.json()
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/menus/menus/${id}/templates/${created.id}/publish?set_active=true`, {
      method: "POST",
      headers: { ...(apiClient as any).getAuthHeader?.() }
    })
    setSaving(false)
    return { status: "success" }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Visual Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded">
              <Puck config={puckConfig as any} data={data} onPublish={onPublish} />
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


