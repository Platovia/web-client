"use client"

import * as React from "react"
import { DropZone, Config } from "@measured/puck"
import { useMenuData } from "../menu-renderer/data-context"

// Define the props for our components
export type MenuProps = {
  MenuSection: {
    category: string
    layout: "Grid" | "List" | "Minimal" | "Card"
    showImages: boolean
    columns: number
  }
  FeaturedItem: {
    itemId: string
    style: "Hero" | "Card" | "Banner"
    showPrice: boolean
  }
  Hero: {
    title: string
    subtitle: string
    backgroundImage?: string
  }
  Space: {
    size: number
  }
  Section: {
    backgroundColor: string
    padding: number
    children: React.ReactNode
  }
  Flex: {
    direction: "row" | "column"
    gap: number
    children: React.ReactNode
  }
  Grid: {
    columns: number
    gap: number
    children: React.ReactNode
  }
  Text: {
    text: string
    align: "left" | "center" | "right"
    size: "small" | "medium" | "large"
  }
}

// We export a function that generates the config based on available data
export const getPuckConfig = ({ categories, items }: { categories: string[], items: any[] }): Config<MenuProps> => {
  
  const categoryOptions = [
    { label: "All Categories", value: "All" },
    ...categories.map(c => ({ label: c, value: c }))
  ]

  const itemOptions = items.map(item => ({ 
    label: `${item.name} (${item.price ? '$' + item.price : ''})`, 
    value: item.id 
  }))

  return {
  categories: {
      layout: { title: "Layout", components: ["Section", "Flex", "Grid", "Space"] },
      menu: { title: "Menu Data", components: ["MenuSection", "FeaturedItem"] },
      basic: { title: "Basic", components: ["Hero", "Text"] },
  },
  components: {
      MenuSection: {
        label: "Menu Category",
      fields: {
          category: { 
            type: "select", 
            options: categoryOptions
          },
          layout: { 
            type: "radio", 
            options: [
              { label: "Grid", value: "Grid" }, 
              { label: "List", value: "List" },
              { label: "Minimal", value: "Minimal" },
              { label: "Card", value: "Card" }
            ],
            defaultValue: "Grid"
          },
          showImages: {
            type: "radio",
            options: [
              { label: "Show Images", value: true },
              { label: "Hide Images", value: false }
            ],
            defaultValue: true
          },
          columns: { type: "number", min: 1, max: 4, defaultValue: 2 }
        },
        defaultProps: {
          category: "All",
          layout: "Grid",
          showImages: true,
          columns: 2
        },
        render: ({ category, layout, showImages, columns }) => {
          const {
            items: allItems,
            formatPrice,
            resolveImageUrl = (url: string) => url || "/placeholder.svg"
          } = useMenuData() as any
          
          // Filter items
          const displayItems = category === "All" 
            ? allItems 
            : allItems.filter((i: any) => i.category === category)

          if (!displayItems || displayItems.length === 0) {
        return (
              <div className="p-4 border border-dashed text-gray-400 text-center rounded">
                No items found in category: {category}
          </div>
        )
          }

        const gridClass = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"

          // Render strategies
          if (layout === "List") {
        return (
              <div className="space-y-4">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-0">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold whitespace-nowrap">{formatPrice(item.price)}</span>
                      {showImages && item.image_url && (
                        <img 
                          src={resolveImageUrl(item.image_url)} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md" 
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          if (layout === "Minimal") {
            return (
              <div className="space-y-2">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="mx-2 text-xs text-gray-400">----------------</span>
                    </div>
                    <span className="font-medium">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            )
          }

          // Grid and Card are similar but Card has more padding/shadow
          return (
            <div className={`grid ${gridClass} gap-6`}>
              {displayItems.map((item: any) => (
                <div 
                  key={item.id} 
                  className={`
                    flex flex-col h-full 
                    ${layout === "Card" ? "bg-white rounded-xl shadow-sm overflow-hidden border" : ""}
                  `}
                >
                  {showImages && item.image_url && (
                    <div className={layout === "Card" ? "aspect-video w-full overflow-hidden" : "aspect-square rounded-lg overflow-hidden mb-3"}>
                      <img 
                        src={resolveImageUrl(item.image_url)} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className={layout === "Card" ? "p-4" : ""}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="font-bold ml-2">{formatPrice(item.price)}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                  </div>
                </div>
              ))}
          </div>
        )
        }
      },
      FeaturedItem: {
        label: "Featured Item",
        fields: {
          itemId: { 
            type: "select",
            options: itemOptions
          },
          style: {
            type: "radio",
            options: [
              { label: "Hero", value: "Hero" },
              { label: "Card", value: "Card" },
              { label: "Banner", value: "Banner" }
            ],
            defaultValue: "Hero"
          },
          showPrice: {
            type: "radio",
            options: [
              { label: "Show Price", value: true },
              { label: "Hide Price", value: false }
            ],
            defaultValue: true
          }
        },
        defaultProps: {
          itemId: itemOptions[0]?.value,
          style: "Hero",
          showPrice: true
        },
        render: ({ itemId, style, showPrice }) => {
          const {
            items: allItems,
            formatPrice,
            resolveImageUrl = (url: string) => url || "/placeholder.svg"
          } = useMenuData() as any
          const item = allItems.find((i: any) => i.id === itemId)

          if (!item) return <div className="text-red-500">Item not found</div>

          if (style === "Banner") {
            return (
              <div className="relative rounded-xl overflow-hidden text-white h-48 flex items-center">
                <div className="absolute inset-0 bg-black/60 z-10" />
                {item.image_url && (
                  <img 
                    src={resolveImageUrl(item.image_url)} 
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="relative z-20 p-6 w-full flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-orange-400">Chef's Special</div>
                    <h3 className="text-2xl font-bold">{item.name}</h3>
                    <p className="text-gray-200 max-w-md truncate">{item.description}</p>
                  </div>
                  {showPrice && <div className="text-3xl font-bold">{formatPrice(item.price)}</div>}
                </div>
              </div>
            )
          }

          // Hero Style
          return (
            <div className={`
              ${style === "Card" ? "border rounded-xl p-6 max-w-sm mx-auto text-center" : "flex flex-col md:flex-row gap-8 items-center py-8"}
            `}>
              {item.image_url && (
                <div className={style === "Card" ? "mb-4" : "w-full md:w-1/2"}>
                  <img 
                    src={resolveImageUrl(item.image_url)} 
                    alt={item.name}
                    className="rounded-xl shadow-lg w-full object-cover aspect-video"
                  />
                </div>
              )}
              <div className={style === "Card" ? "" : "w-full md:w-1/2"}>
                <h3 className="text-3xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-lg mb-4">{item.description}</p>
                {showPrice && (
                  <div className="text-2xl font-bold text-orange-600 mb-4">
                    {formatPrice(item.price)}
                  </div>
                )}
                <button className="bg-black text-white px-6 py-3 rounded-full font-semibold">
                  Order Now
                </button>
              </div>
        </div>
      )
        }
      },
      Hero: {
        render: ({ title, subtitle }) => (
          <div className="text-center py-12">
            <h1 className="text-5xl font-bold mb-4">{title}</h1>
            <p className="text-xl text-gray-600">{subtitle}</p>
          </div>
        ),
        fields: {
          title: { type: "text" },
          subtitle: { type: "text" }
        },
        defaultProps: {
          title: "Our Menu",
          subtitle: "Fresh & Delicious"
        }
      },
      Section: {
        render: ({ children, backgroundColor, padding }) => (
          <section style={{ backgroundColor, padding: `${padding}px 0` }}>
            <div className="max-w-4xl mx-auto px-4">
              {children}
            </div>
          </section>
        ),
      fields: {
          backgroundColor: { type: "text" },
          padding: { type: "number", min: 0, max: 100, defaultValue: 40 },
          children: { type: "number" } // Puck handles children specially, but we define it for TS
        },
        defaultProps: {
          backgroundColor: "transparent",
          padding: 40,
          children: null
        }
      },
      Flex: {
        render: ({ children, direction, gap }) => (
          <div className="flex" style={{ flexDirection: direction, gap: `${gap}px` }}>
            {children}
          </div>
        ),
        fields: {
          direction: {
            type: "radio",
            options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }],
            defaultValue: "row"
          },
          gap: { type: "number", defaultValue: 16 },
          children: { type: "number" } // Puck handles children specially
      },
      defaultProps: {
          direction: "row",
          gap: 16,
          children: null
        }
      },
      Grid: {
        render: ({ children, columns, gap }) => (
          <div 
            className="grid" 
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`, 
              gap: `${gap}px` 
            }}
          >
            {children}
          </div>
        ),
        fields: {
          columns: { type: "number", min: 1, max: 12, defaultValue: 3 },
          gap: { type: "number", defaultValue: 16 },
          children: { type: "number" } // Puck handles children specially
        },
        defaultProps: {
          columns: 3,
          gap: 16,
          children: null
        }
      },
      Space: {
        render: ({ size }) => <div style={{ height: size }} />,
        fields: { size: { type: "number", defaultValue: 24 } },
        defaultProps: { size: 24 }
      },
      Text: {
        render: ({ text, align, size }) => (
          <p 
            className={`
              ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}
              ${size === "large" ? "text-xl" : size === "small" ? "text-sm" : "text-base"}
            `}
          >
            {text}
          </p>
        ),
        fields: {
          text: { type: "textarea" },
          align: { 
            type: "radio", 
            options: [
              { label: "Left", value: "left" }, 
              { label: "Center", value: "center" },
              { label: "Right", value: "right" }
            ] 
          },
          size: {
            type: "radio",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" }
            ]
          }
        },
        defaultProps: {
          text: "Enter text here...",
          align: "left",
          size: "medium"
        }
      }
    }
  }
}
