"use client"

import * as React from "react"

export const puckConfig = {
  components: {
    Hero: {
      fields: { title: { type: "text" }, subtitle: { type: "text" } },
      render: ({ title = "Our Menu", subtitle = "Fresh and delicious" }: any) => (
        <div className="py-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      ),
      defaultProps: { title: "Our Menu", subtitle: "Fresh and delicious" },
    },
    Heading: {
      fields: { text: { type: "text" }, size: { type: "select", options: ["h2","h3","h4"], defaultValue: "h2" } },
      render: ({ text = "Heading", size = "h2" }: any) => {
        const Tag = size as keyof JSX.IntrinsicElements
        return <Tag className="font-semibold my-4">{text}</Tag>
      },
      defaultProps: { text: "Heading", size: "h2" },
    },
    Text: {
      fields: { text: { type: "textarea" } },
      render: ({ text = "Body text" }: any) => <p className="text-gray-700">{text}</p>,
      defaultProps: { text: "Body text" },
    },
    ItemsGrid: {
      fields: {
        columns: { type: "number", min: 1, max: 4, step: 1, defaultValue: 3 },
        showImages: { type: "checkbox", defaultValue: true },
      },
      render: ({ columns = 3, showImages = true, __data }: any) => {
        const items = (__data && (__data as any).items) || []
        const gridClass = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"
        return (
          <div className={`grid ${gridClass} gap-6`}>
            {items.map((item: any) => (
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


