"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { MenuRendererProps } from "../menu-renderer/types"
import { getPuckConfig } from "./config"

const Render = dynamic(() => import("@measured/puck").then(m => (m as any).Render), { ssr: false }) as any

export default function BuilderRenderer({ layout, data }: { layout: any; data: Omit<MenuRendererProps, "themeConfig" | "templateId"> }) {
  // Generate config based on the provided data
  const config = React.useMemo(() => {
    return getPuckConfig({
      categories: data.categories || [],
      items: data.items || []
    })
  }, [data.categories, data.items])

  // Pass the full layout object (including zones/root) so DropZones render their children
  const fullLayout = typeof layout === "object" && layout?.content ? layout : { content: layout }
  
  return <Render config={config as any} data={{ ...fullLayout, __data: data }} />
}
