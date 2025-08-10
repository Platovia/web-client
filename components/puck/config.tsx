"use client"

import * as React from "react"
import { DropZone } from "@measured/puck"
import { useMenuData } from "../menu-renderer/data-context"

function safeUseMenuData(): any {
  try {
    return useMenuData() as any
  } catch {
    // Fallback for editor preview where provider isn't present
    return {
      items: [
        { id: "i1", name: "Sample Item", description: "Tasty and fresh", price: 9.99, image_url: "" },
        { id: "i2", name: "Another Dish", description: "Chef special", price: 12.5, image_url: "" },
      ],
      categories: ["Starters", "Mains", "Desserts"],
      selectedCategory: "All",
      onChangeCategory: () => {},
    }
  }
}

export const puckConfig = {
  // Group components to mirror sidebar
  categories: {
    layout: { title: "Layout", components: ["Grid", "Flex", "Space", "Section"] },
    typography: { title: "Typography", components: ["Heading", "Text", "SectionHeader"] },
    actions: { title: "Actions", components: ["Button"] },
    media: { title: "Media", components: ["Image", "Logos"] },
    other: { title: "Other", components: ["Card", "Hero", "Stats", "Template", "ItemsGrid", "CategoryTabs", "Footer"] },
  },
  components: {
    // Layout primitives (stubs to match sidebar)
    Grid: {
      fields: {
        columns: { type: "number", min: 1, max: 12, defaultValue: 3 },
        gap: { type: "number", min: 0, max: 64, defaultValue: 16 },
        align: { type: "select", options: ["start", "center", "end", "stretch"], defaultValue: "start" },
        justify: { type: "select", options: ["start", "center", "end", "stretch"], defaultValue: "start" },
      },
      render: ({ columns = 3, gap = 16, align = "start", justify = "start" }: any) => {
        const alignItems = align === "start" ? "start" : align === "end" ? "end" : align
        const justifyItems = justify === "start" ? "start" : justify === "end" ? "end" : justify
        return (
          <DropZone
            zone="content"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: `${gap}px`,
              alignItems,
              justifyItems,
              width: "100%",
              minHeight: 32,
            }}
          />
        )
      },
      defaultProps: { columns: 3, gap: 16 },
    },
    Flex: {
      fields: {
        direction: { type: "radio", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }], defaultValue: "row" },
        justify: { type: "select", options: ["start", "center", "end", "between"], defaultValue: "start" },
        align: { type: "select", options: ["start", "center", "end", "stretch"], defaultValue: "start" },
        gap: { type: "number", min: 0, max: 96, defaultValue: 16 },
        wrap: { type: "radio", options: [{ label: "true", value: true }, { label: "false", value: false }], defaultValue: true },
        grow: { type: "radio", options: [{ label: "true", value: 1 }, { label: "false", value: 0 }], defaultValue: 1 },
        paddingY: { type: "number", min: 0, max: 96, defaultValue: 0 },
      },
      render: ({ direction = "row", justify = "start", align = "start", gap = 16, wrap = true, grow = 1, paddingY = 0 }: any) => {
        const justifyContent =
          justify === "between" ? "space-between" : justify === "start" ? "flex-start" : justify === "end" ? "flex-end" : justify
        const alignItems = align === "start" ? "flex-start" : align === "end" ? "flex-end" : align
        return (
          <DropZone
            zone="content"
            style={{
              display: "flex",
              flexDirection: direction,
              justifyContent,
              alignItems,
              gap: `${gap}px`,
              flexWrap: wrap ? "wrap" : "nowrap",
              flexGrow: Number(grow) || 0,
              paddingTop: `${paddingY}px`,
              paddingBottom: `${paddingY}px`,
              width: "100%",
              minHeight: 32,
            }}
          />
        )
      },
      defaultProps: { direction: "row", justify: "start", align: "start", gap: 16, wrap: true, grow: 1, paddingY: 0 },
    },
    Space: {
      fields: { size: { type: "number", min: 0, max: 64, defaultValue: 8 } },
      render: ({ size = 8 }: any) => <div style={{ height: size, width: size }} />,
      defaultProps: { size: 8 },
    },
    Section: {
      fields: { backgroundColor: { type: "text" }, padding: { type: "number", min: 0, max: 32, defaultValue: 8 }, bg: { type: "text", defaultValue: "transparent" } },
      render: ({ backgroundColor = 'white', padding = 8, bg = "transparent", children }: any) => (
        <section style={{ backgroundColor, padding, background: bg }}>{children}</section>
      )
    },
    Hero: {
      fields: { title: { type: "text" }, subtitle: { type: "text" } },
      render: ({ title = "Our Menu", subtitle = "Fresh and delicious", id, __key }: any) => {
        const key = __key || id || `hero-${title}`
        return (
          <div key={key} className="py-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        )
      },
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
    SectionHeader: {
      fields: { title: { type: "text" }, subtitle: { type: "text" }, align: { type: "select", options: ["left","center","right"], defaultValue: "left" } },
      render: ({ title = "Section", subtitle, align = "left" }: any) => (
        <div className={`my-6 text-${align}`}>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      ),
      defaultProps: { title: "Section", align: "left" },
    },
    CategoryTabs: {
      fields: { showAll: { type: "checkbox", defaultValue: true } },
      render: ({ showAll = true }: any) => {
        const { categories = [], selectedCategory = "All", onSelectCategory } = safeUseMenuData()
        const cats = showAll ? ["All", ...categories] : categories
        return (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cats.map((c: string, idx: number) => {
              const key = `cat-${String(c)}-${idx}`
              return (
                <button 
                  key={key} 
                  onClick={() => onSelectCategory && onSelectCategory(c)} 
                  className={`px-3 py-1 rounded border whitespace-nowrap ${
                    selectedCategory === c ? 'bg-black text-white' : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        )
      },
      defaultProps: { showAll: true },
    },
    ItemCard: {
      fields: { showImage: { type: "checkbox", defaultValue: true } },
      render: ({ item, showImage = true }: any) => (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{item?.name}</div>
              <div className="text-sm text-gray-600">{item?.description}</div>
            </div>
            <div className="font-bold" style={{ color: "var(--menu-color-price)" }}>{item?.price}</div>
          </div>
          {showImage && item?.image_url && <img src={item.image_url} alt={item.name} className="mt-3 w-full h-36 object-cover rounded" />}
        </div>
      ),
      defaultProps: { showImage: true },
    },
    ItemsGrid: {
      fields: {
        columns: { type: "number", min: 1, max: 4, step: 1, defaultValue: 3 },
        showImages: { type: "checkbox", defaultValue: true },
      },
      render: ({ columns = 3, showImages = true }: any) => {
        const { items = [], formatPrice } = safeUseMenuData()
        const gridClass = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4"
        return (
          <div className={`grid ${gridClass} gap-6 p-4`}>
            {items.map((item: any, idx: number) => {
              const key = item.id ? `itm-${item.id}` : `itm-${idx}-${item.name || 'unknown'}`
              return (
                <div key={key} data-key={key} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name || "Menu Item"}</div>
                      <div className="text-sm text-gray-600">{item.description || "Delicious dish"}</div>
                    </div>
                    <div className="font-bold ml-2">
                      {formatPrice ? formatPrice(item.price || 0) : `$${(item.price || 0).toFixed(2)}`}
                    </div>
                  </div>
                  {showImages && item.image_url && (
                    <img src={item.image_url} alt={item.name} className="mt-3 w-full h-36 object-cover rounded" />
                  )}
                </div>
              )
            })}
          </div>
        )
      },
      defaultProps: { columns: 3, showImages: true },
    },
    // Other
    Card: {
      fields: { title: { type: "text" }, body: { type: "textarea" } },
      render: ({ title = "Card title", body = "Card body" }: any) => (
        <div className="rounded border p-4 shadow-sm">
          <div className="font-semibold mb-2">{title}</div>
          <div className="text-sm text-gray-600">{body}</div>
        </div>
      )
    },
    Image: {
      fields: {
        src: { type: "text", placeholder: "/images/photo.jpg" },
        alt: { type: "text", placeholder: "Descriptive alt" },
        width: { type: "number", min: 0, max: 2000, defaultValue: 0 },
        height: { type: "number", min: 0, max: 2000, defaultValue: 0 },
        fit: { type: "select", options: ["cover", "contain", "fill", "none", "scale-down"], defaultValue: "cover" },
        radius: { type: "number", min: 0, max: 64, defaultValue: 8 },
        link: { type: "text", placeholder: "https://" },
        caption: { type: "text", placeholder: "Optional caption" },
      },
      defaultProps: {
        src: "/placeholder.svg?height=320&width=640&text=Image",
        alt: "",
        width: 0,
        height: 0,
        fit: "cover",
        radius: 8,
        caption: "",
      },
      render: ({ src, alt = "", width = 0, height = 0, fit = "cover", radius = 8, link, caption }: any) => {
        const img = (
          <img
            src={src || "/placeholder.svg?height=320&width=640&text=Image"}
            alt={alt}
            style={{
              width: width > 0 ? `${width}px` : "100%",
              height: height > 0 ? `${height}px` : "auto",
              objectFit: fit as any,
              borderRadius: `${radius}px`,
              display: "block",
            }}
          />
        )
        const body = link ? (
          <a href={link} target="_blank" rel="noreferrer">{img}</a>
        ) : (
          img
        )
        return caption ? (
          <figure>
            {body}
            <figcaption className="text-xs text-gray-500 mt-1">{caption}</figcaption>
          </figure>
        ) : (
          body
        )
      },
    },
    Logos: {
      fields: { urls: { type: "list", getItemLabel: (x: string) => x, defaultValue: ["/placeholder.svg"] } },
      render: ({ urls = [] }: any) => (
        <div className="flex gap-4 items-center flex-wrap">
          {urls.map((u: string, i: number) => (
            <img key={`logo-${i}-${u}`} src={u} alt="logo" className="h-10 object-contain" />
          ))}
        </div>
      )
    },
    Stats: {
      fields: { items: { type: "list", getItemLabel: (x: any) => x?.label || "Stat", defaultValue: [{ label: "Dishes", value: "120+" }] } },
      render: ({ items = [] }: any) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((s: any, i: number) => (
            <div key={`stat-${i}-${s?.label}`} className="text-center">
              <div className="text-2xl font-bold">{s?.value}</div>
              <div className="text-xs text-gray-500">{s?.label}</div>
            </div>
          ))}
        </div>
      )
    },
    Template: {
      fields: { note: { type: "text", defaultValue: "Starter section" } },
      render: ({ note = "Starter section" }: any) => <div className="italic text-gray-500">{note}</div>,
    },
    Footer: {
      fields: { text: { type: "text" } },
      render: ({ text = "" }: any) => <div className="text-center text-xs text-gray-500 my-8">{text}</div>,
      defaultProps: { text: "" },
    },
  },
} as const


