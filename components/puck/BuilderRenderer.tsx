"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type { MenuRendererProps } from "../menu-renderer/types"

// Load at runtime to avoid server bundle issues if Puck is not installed in some environments
const Render = dynamic(() => import("@measured/puck").then(m => (m as any).Render), { ssr: false }) as any

// Minimal block map to start; extend later
const blockConfig = {
  components: {
    Hero: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
      },
      render: ({ title, subtitle }: any) => (
        <div className="py-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      ),
      defaultProps: { title: "Our Menu", subtitle: "Fresh and delicious" },
    },
    ItemsGrid: {
      fields: {
        columns: { type: "number", min: 1, max: 4, step: 1 },
        showImages: { type: "checkbox" },
      },
      render: ({ columns = 3, showImages = true, __data }: any) => {
        const { items, restaurant } = (__data || {}) as { items: MenuRendererProps["items"]; restaurant: any }
        const gridClass = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"
        return (
          <div className={`grid ${gridClass} gap-6`}>
            {items?.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <div className="font-bold">{item.price}</div>
                </div>
                {showImages && item.image_url && (
                  <img src={item.image_url} alt={item.name} className="mt-3 w-full h-36 object-cover rounded" />
                )}
              </div>
            ))}
          </div>
        )
      },
      defaultProps: { columns: 3, showImages: true },
    },
  },
} as const

export default function BuilderRenderer({ layout, data }: { layout: any; data: Omit<MenuRendererProps, "themeConfig" | "templateId"> }) {
  // Inject data context into Puck by attaching to each component props as __data
  // Render expects { content } shape; support both direct and wrapped
  const content = layout?.content ?? layout

  return (
    <Render config={blockConfig as any} data={{ content }} overrides={{
      // Inject data into every component render call via a context wrapper
      // Puck doesn't natively pass external data, so we rely on component render using __data prop from data.content nodes
    }} />
  )
}


