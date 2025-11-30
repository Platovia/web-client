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
    // Card/Grid styling
    cardBackground?: string
    cardRadius?: number
    cardShadow?: "none" | "small" | "medium" | "large"
    cardPadding?: number
    gap?: number
    // List styling
    dividerStyle?: "none" | "line" | "dots"
    priceAlign?: "right" | "inline"
    // Typography
    titleSize?: "xs" | "small" | "medium" | "large" | "xl"
    titleWeight?: "normal" | "medium" | "semibold" | "bold"
    descriptionSize?: "xs" | "small" | "medium" | "large"
    priceSize?: "small" | "medium" | "large" | "xl"
    priceColor?: string
  }
  FeaturedItem: {
    itemId: string
    style: "Hero" | "Card" | "Banner"
    showPrice: boolean
    // Typography
    titleSize?: "xl" | "2xl" | "3xl" | "4xl"
    titleWeight?: "normal" | "medium" | "semibold" | "bold"
    descriptionSize?: "small" | "medium" | "large" | "xl"
    // Visuals
    badgeText?: string
    badgeColor?: string
    buttonLabel?: string
    buttonVariant?: "solid" | "outline" | "ghost"
    backgroundStyle?: "light" | "dark" | "gradient"
  }
  Hero: {
    title: string
    subtitle: string
    backgroundImage?: string
    // Typography
    titleSize?: "2xl" | "3xl" | "4xl" | "5xl" | "6xl"
    titleWeight?: "normal" | "medium" | "semibold" | "bold"
    subtitleSize?: "sm" | "base" | "lg" | "xl" | "2xl"
    align?: "left" | "center" | "right"
    titleColor?: string
    subtitleColor?: string
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
    // Enhanced typography
    fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
    fontWeight?: "normal" | "medium" | "semibold" | "bold" | "extrabold"
    color?: string
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
    lineHeight?: "tight" | "normal" | "relaxed" | "loose"
    letterSpacing?: "tight" | "normal" | "wide" | "wider"
  }
  Image: {
    src: string
    alt: string
    width?: "full" | "auto" | "small" | "medium" | "large"
    height?: number
    objectFit?: "cover" | "contain" | "fill" | "none"
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full"
  }
  ImageCard: {
    src: string
    alt: string
    title?: string
    description?: string
    overlay?: boolean
    overlayColor?: string
    textAlign?: "left" | "center" | "right"
    height?: number
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
      basic: { title: "Basic", components: ["Hero", "Text", "Image", "ImageCard"] },
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
          columns: { type: "number", min: 1, max: 4, defaultValue: 2 },
          // Card/Grid styling
          cardBackground: { type: "text", label: "Card Background" },
          cardRadius: { type: "number", min: 0, max: 32, label: "Card Radius (px)" },
          cardShadow: {
            type: "select",
            label: "Card Shadow",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" }
            ]
          },
          cardPadding: { type: "number", min: 0, max: 48, label: "Card Padding (px)" },
          gap: { type: "number", min: 0, max: 48, label: "Gap between items (px)" },
          // List styling
          dividerStyle: {
            type: "select",
            label: "List Divider Style",
            options: [
              { label: "None", value: "none" },
              { label: "Line", value: "line" },
              { label: "Dots", value: "dots" }
            ]
          },
          priceAlign: {
            type: "radio",
            label: "Price Alignment",
            options: [
              { label: "Right", value: "right" },
              { label: "Inline", value: "inline" }
            ]
          },
          // Typography
          titleSize: {
            type: "select",
            label: "Title Size",
            options: [
              { label: "Extra Small", value: "xs" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
              { label: "Extra Large", value: "xl" }
            ]
          },
          titleWeight: {
            type: "select",
            label: "Title Weight",
            options: [
              { label: "Normal", value: "normal" },
              { label: "Medium", value: "medium" },
              { label: "Semibold", value: "semibold" },
              { label: "Bold", value: "bold" }
            ]
          },
          descriptionSize: {
            type: "select",
            label: "Description Size",
            options: [
              { label: "Extra Small", value: "xs" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" }
            ]
          },
          priceSize: {
            type: "select",
            label: "Price Size",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
              { label: "Extra Large", value: "xl" }
            ]
          },
          priceColor: { type: "text", label: "Price Color (hex or CSS)" }
        },
        defaultProps: {
          category: "All",
          layout: "Grid",
          showImages: true,
          columns: 2,
          cardRadius: 12,
          cardShadow: "small",
          cardPadding: 16,
          gap: 24,
          dividerStyle: "line",
          priceAlign: "right",
          titleSize: "medium",
          titleWeight: "semibold",
          descriptionSize: "small",
          priceSize: "medium"
        },
        render: (props) => {
          const {
            category, layout, showImages, columns,
            cardBackground, cardRadius = 12, cardShadow = "small", cardPadding = 16, gap = 24,
            dividerStyle = "line", priceAlign = "right",
            titleSize = "medium", titleWeight = "semibold",
            descriptionSize = "small", priceSize = "medium", priceColor
          } = props

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

          // Helper functions for styling
          const getShadowClass = () => {
            if (cardShadow === "none") return ""
            if (cardShadow === "small") return "shadow-sm"
            if (cardShadow === "medium") return "shadow-md"
            if (cardShadow === "large") return "shadow-lg"
            return "shadow-sm"
          }

          const getTitleSizeClass = () => {
            if (titleSize === "xs") return "text-xs"
            if (titleSize === "small") return "text-sm"
            if (titleSize === "medium") return "text-base"
            if (titleSize === "large") return "text-lg"
            if (titleSize === "xl") return "text-xl"
            return "text-base"
          }

          const getTitleWeightClass = () => {
            if (titleWeight === "normal") return "font-normal"
            if (titleWeight === "medium") return "font-medium"
            if (titleWeight === "semibold") return "font-semibold"
            if (titleWeight === "bold") return "font-bold"
            return "font-semibold"
          }

          const getDescriptionSizeClass = () => {
            if (descriptionSize === "xs") return "text-xs"
            if (descriptionSize === "small") return "text-sm"
            if (descriptionSize === "medium") return "text-base"
            if (descriptionSize === "large") return "text-lg"
            return "text-sm"
          }

          const getPriceSizeClass = () => {
            if (priceSize === "small") return "text-sm"
            if (priceSize === "medium") return "text-base"
            if (priceSize === "large") return "text-lg"
            if (priceSize === "xl") return "text-xl"
            return "text-base"
          }

          // Render strategies
          if (layout === "List") {
            const dividerClass = dividerStyle === "none" ? "" :
              dividerStyle === "dots" ? "border-b border-dotted" : "border-b"

        return (
              <div style={{ gap: `${gap}px` }} className="flex flex-col">
                {displayItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex ${priceAlign === "inline" ? "flex-col" : "justify-between items-start"} pb-4 last:pb-0 ${dividerClass}`}
                  >
                    <div className={`flex-1 ${priceAlign === "right" ? "pr-4" : ""}`}>
                      <h3 className={`${getTitleSizeClass()} ${getTitleWeightClass()}`}>{item.name}</h3>
                      <p className={`${getDescriptionSizeClass()} text-gray-600 line-clamp-2`}>{item.description}</p>
                      {priceAlign === "inline" && (
                        <span
                          className={`${getPriceSizeClass()} font-bold mt-2 inline-block`}
                          style={{ color: priceColor || undefined }}
                        >
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {priceAlign === "right" && (
                        <span
                          className={`${getPriceSizeClass()} font-bold whitespace-nowrap`}
                          style={{ color: priceColor || undefined }}
                        >
                          {formatPrice(item.price)}
                        </span>
                      )}
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
              <div style={{ gap: `${gap}px` }} className="flex flex-col">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-baseline">
                    <div>
                      <span className={`${getTitleWeightClass()}`}>{item.name}</span>
                      <span className="mx-2 text-xs text-gray-400">----------------</span>
                    </div>
                    <span
                      className={`${getPriceSizeClass()} ${getTitleWeightClass()}`}
                      style={{ color: priceColor || undefined }}
                    >
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            )
          }

          // Grid and Card with customizable styling
          return (
            <div className={`grid ${gridClass}`} style={{ gap: `${gap}px` }}>
              {displayItems.map((item: any) => (
                <div
                  key={item.id}
                  className={`flex flex-col h-full ${layout === "Card" ? `${getShadowClass()} overflow-hidden border` : ""}`}
                  style={{
                    backgroundColor: layout === "Card" ? cardBackground || "white" : undefined,
                    borderRadius: layout === "Card" ? `${cardRadius}px` : undefined
                  }}
                >
                  {showImages && item.image_url && (
                    <div
                      className={layout === "Card" ? "aspect-video w-full overflow-hidden" : "aspect-square overflow-hidden mb-3"}
                      style={{
                        borderRadius: layout === "Card" ? `${cardRadius}px ${cardRadius}px 0 0` : `${cardRadius}px`
                      }}
                    >
                      <img
                        src={resolveImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div style={{ padding: layout === "Card" ? `${cardPadding}px` : undefined }}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`${getTitleSizeClass()} ${getTitleWeightClass()}`}>{item.name}</h3>
                      <span
                        className={`${getPriceSizeClass()} font-bold ml-2`}
                        style={{ color: priceColor || undefined }}
                      >
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <p className={`${getDescriptionSizeClass()} text-gray-600 line-clamp-3`}>{item.description}</p>
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
          },
          // Typography
          titleSize: {
            type: "select",
            label: "Title Size",
            options: [
              { label: "Extra Large", value: "xl" },
              { label: "2XL", value: "2xl" },
              { label: "3XL", value: "3xl" },
              { label: "4XL", value: "4xl" }
            ]
          },
          titleWeight: {
            type: "select",
            label: "Title Weight",
            options: [
              { label: "Normal", value: "normal" },
              { label: "Medium", value: "medium" },
              { label: "Semibold", value: "semibold" },
              { label: "Bold", value: "bold" }
            ]
          },
          descriptionSize: {
            type: "select",
            label: "Description Size",
            options: [
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
              { label: "Extra Large", value: "xl" }
            ]
          },
          // Visuals
          badgeText: { type: "text", label: "Badge Text" },
          badgeColor: { type: "text", label: "Badge Color (hex or CSS)" },
          buttonLabel: { type: "text", label: "Button Label" },
          buttonVariant: {
            type: "select",
            label: "Button Style",
            options: [
              { label: "Solid", value: "solid" },
              { label: "Outline", value: "outline" },
              { label: "Ghost", value: "ghost" }
            ]
          },
          backgroundStyle: {
            type: "select",
            label: "Background Style",
            options: [
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
              { label: "Gradient", value: "gradient" }
            ]
          }
        },
        defaultProps: {
          itemId: itemOptions[0]?.value,
          style: "Hero",
          showPrice: true,
          titleSize: "3xl",
          titleWeight: "bold",
          descriptionSize: "large",
          badgeText: "Chef's Special",
          badgeColor: "#f97316",
          buttonLabel: "Order Now",
          buttonVariant: "solid",
          backgroundStyle: "dark"
        },
        render: (props) => {
          const {
            itemId, style, showPrice,
            titleSize = "3xl", titleWeight = "bold",
            descriptionSize = "large",
            badgeText = "Chef's Special", badgeColor = "#f97316",
            buttonLabel = "Order Now", buttonVariant = "solid",
            backgroundStyle = "dark"
          } = props

          const {
            items: allItems,
            formatPrice,
            resolveImageUrl = (url: string) => url || "/placeholder.svg"
          } = useMenuData() as any
          const item = allItems.find((i: any) => i.id === itemId)

          if (!item) return <div className="text-red-500">Item not found</div>

          // Helper functions for styling
          const getTitleSizeClass = () => {
            if (titleSize === "xl") return "text-xl"
            if (titleSize === "2xl") return "text-2xl"
            if (titleSize === "3xl") return "text-3xl"
            if (titleSize === "4xl") return "text-4xl"
            return "text-3xl"
          }

          const getTitleWeightClass = () => {
            if (titleWeight === "normal") return "font-normal"
            if (titleWeight === "medium") return "font-medium"
            if (titleWeight === "semibold") return "font-semibold"
            if (titleWeight === "bold") return "font-bold"
            return "font-bold"
          }

          const getDescriptionSizeClass = () => {
            if (descriptionSize === "small") return "text-sm"
            if (descriptionSize === "medium") return "text-base"
            if (descriptionSize === "large") return "text-lg"
            if (descriptionSize === "xl") return "text-xl"
            return "text-lg"
          }

          const getButtonClass = () => {
            const baseClass = "px-6 py-3 rounded-full font-semibold transition-colors"
            if (buttonVariant === "solid") return `${baseClass} bg-black text-white hover:bg-gray-800`
            if (buttonVariant === "outline") return `${baseClass} border-2 border-black text-black hover:bg-black hover:text-white`
            if (buttonVariant === "ghost") return `${baseClass} text-black hover:bg-gray-100`
            return `${baseClass} bg-black text-white`
          }

          const getBackgroundClass = () => {
            if (backgroundStyle === "light") return "bg-black/40"
            if (backgroundStyle === "dark") return "bg-black/60"
            if (backgroundStyle === "gradient") return "bg-gradient-to-r from-black/70 to-black/50"
            return "bg-black/60"
          }

          if (style === "Banner") {
            return (
              <div className="relative rounded-xl overflow-hidden text-white h-48 flex items-center">
                <div className={`absolute inset-0 z-10 ${getBackgroundClass()}`} />
                {item.image_url && (
                  <img
                    src={resolveImageUrl(item.image_url)}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="relative z-20 p-6 w-full flex justify-between items-center">
                  <div>
                    {badgeText && (
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: badgeColor }}
                      >
                        {badgeText}
                      </div>
                    )}
                    <h3 className={`${getTitleSizeClass()} ${getTitleWeightClass()}`}>{item.name}</h3>
                    <p className={`${getDescriptionSizeClass()} text-gray-200 max-w-md truncate`}>{item.description}</p>
                  </div>
                  {showPrice && (
                    <div className={`${getTitleSizeClass()} ${getTitleWeightClass()}`}>
                      {formatPrice(item.price)}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          // Hero and Card Style
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
                {badgeText && style === "Card" && (
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-2 inline-block"
                    style={{ color: badgeColor }}
                  >
                    {badgeText}
                  </div>
                )}
                <h3 className={`${getTitleSizeClass()} ${getTitleWeightClass()} mb-2`}>{item.name}</h3>
                <p className={`${getDescriptionSizeClass()} text-gray-600 mb-4`}>{item.description}</p>
                {showPrice && (
                  <div className="text-2xl font-bold text-orange-600 mb-4">
                    {formatPrice(item.price)}
                  </div>
                )}
                {buttonLabel && (
                  <button className={getButtonClass()}>
                    {buttonLabel}
                  </button>
                )}
              </div>
        </div>
      )
        }
      },
      Hero: {
        render: (props) => {
          const {
            title, subtitle,
            titleSize = "5xl", titleWeight = "bold",
            subtitleSize = "xl", align = "center",
            titleColor, subtitleColor
          } = props

          const getTitleSizeClass = () => {
            if (titleSize === "2xl") return "text-2xl"
            if (titleSize === "3xl") return "text-3xl"
            if (titleSize === "4xl") return "text-4xl"
            if (titleSize === "5xl") return "text-5xl"
            if (titleSize === "6xl") return "text-6xl"
            return "text-5xl"
          }

          const getTitleWeightClass = () => {
            if (titleWeight === "normal") return "font-normal"
            if (titleWeight === "medium") return "font-medium"
            if (titleWeight === "semibold") return "font-semibold"
            if (titleWeight === "bold") return "font-bold"
            return "font-bold"
          }

          const getSubtitleSizeClass = () => {
            if (subtitleSize === "sm") return "text-sm"
            if (subtitleSize === "base") return "text-base"
            if (subtitleSize === "lg") return "text-lg"
            if (subtitleSize === "xl") return "text-xl"
            if (subtitleSize === "2xl") return "text-2xl"
            return "text-xl"
          }

          const getAlignClass = () => {
            if (align === "left") return "text-left"
            if (align === "center") return "text-center"
            if (align === "right") return "text-right"
            return "text-center"
          }

          return (
            <div className={`${getAlignClass()} py-12`}>
              <h1
                className={`${getTitleSizeClass()} ${getTitleWeightClass()} mb-4`}
                style={{ color: titleColor || undefined }}
              >
                {title}
              </h1>
              <p
                className={`${getSubtitleSizeClass()} text-gray-600`}
                style={{ color: subtitleColor || undefined }}
              >
                {subtitle}
              </p>
            </div>
          )
        },
        fields: {
          title: { type: "text" },
          subtitle: { type: "text" },
          titleSize: {
            type: "select",
            label: "Title Size",
            options: [
              { label: "2XL", value: "2xl" },
              { label: "3XL", value: "3xl" },
              { label: "4XL", value: "4xl" },
              { label: "5XL", value: "5xl" },
              { label: "6XL", value: "6xl" }
            ]
          },
          titleWeight: {
            type: "select",
            label: "Title Weight",
            options: [
              { label: "Normal", value: "normal" },
              { label: "Medium", value: "medium" },
              { label: "Semibold", value: "semibold" },
              { label: "Bold", value: "bold" }
            ]
          },
          subtitleSize: {
            type: "select",
            label: "Subtitle Size",
            options: [
              { label: "Small", value: "sm" },
              { label: "Base", value: "base" },
              { label: "Large", value: "lg" },
              { label: "XL", value: "xl" },
              { label: "2XL", value: "2xl" }
            ]
          },
          align: {
            type: "radio",
            label: "Alignment",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" }
            ]
          },
          titleColor: { type: "text", label: "Title Color (hex or CSS)" },
          subtitleColor: { type: "text", label: "Subtitle Color (hex or CSS)" }
        },
        defaultProps: {
          title: "Our Menu",
          subtitle: "Fresh & Delicious",
          titleSize: "5xl",
          titleWeight: "bold",
          subtitleSize: "xl",
          align: "center"
        }
      },
      Section: {
        render: ({ puck, backgroundColor, padding }) => (
          <section style={{ backgroundColor, padding: `${padding}px 0` }}>
            <div className="max-w-4xl mx-auto px-4">
              <DropZone zone="section-content" />
            </div>
          </section>
        ),
      fields: {
          backgroundColor: { type: "text" },
          padding: { type: "number", min: 0, max: 100, defaultValue: 40 }
        },
        defaultProps: {
          backgroundColor: "transparent",
          padding: 40
        }
      },
      Flex: {
        render: ({ puck, direction, gap }) => (
          <div className="flex" style={{ flexDirection: direction, gap: `${gap}px` }}>
            <DropZone zone="flex-items" />
          </div>
        ),
        fields: {
          direction: {
            type: "radio",
            options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }],
            defaultValue: "row"
          },
          gap: { type: "number", defaultValue: 16 }
      },
      defaultProps: {
          direction: "row",
          gap: 16
        }
      },
      Grid: {
        render: ({ puck, columns, gap }) => (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${gap}px`
            }}
          >
            <DropZone zone="grid-items" />
          </div>
        ),
        fields: {
          columns: { type: "number", min: 1, max: 12, defaultValue: 3 },
          gap: { type: "number", defaultValue: 16 }
        },
        defaultProps: {
          columns: 3,
          gap: 16
        }
      },
      Space: {
        render: ({ size }) => <div style={{ height: size }} />,
        fields: { size: { type: "number", defaultValue: 24 } },
        defaultProps: { size: 24 }
      },
      Text: {
        render: (props) => {
          const {
            text, align = "left", size = "medium",
            fontSize, fontWeight, color,
            textTransform, lineHeight, letterSpacing
          } = props

          const getAlignClass = () => {
            if (align === "center") return "text-center"
            if (align === "right") return "text-right"
            return "text-left"
          }

          const getSizeClass = () => {
            if (size === "large") return "text-xl"
            if (size === "small") return "text-sm"
            return "text-base"
          }

          const getFontSizeClass = () => {
            if (!fontSize) return ""
            if (fontSize === "xs") return "text-xs"
            if (fontSize === "sm") return "text-sm"
            if (fontSize === "base") return "text-base"
            if (fontSize === "lg") return "text-lg"
            if (fontSize === "xl") return "text-xl"
            if (fontSize === "2xl") return "text-2xl"
            if (fontSize === "3xl") return "text-3xl"
            return ""
          }

          const getFontWeightClass = () => {
            if (!fontWeight) return ""
            if (fontWeight === "normal") return "font-normal"
            if (fontWeight === "medium") return "font-medium"
            if (fontWeight === "semibold") return "font-semibold"
            if (fontWeight === "bold") return "font-bold"
            if (fontWeight === "extrabold") return "font-extrabold"
            return ""
          }

          const getTextTransformClass = () => {
            if (!textTransform || textTransform === "none") return ""
            if (textTransform === "uppercase") return "uppercase"
            if (textTransform === "lowercase") return "lowercase"
            if (textTransform === "capitalize") return "capitalize"
            return ""
          }

          const getLineHeightClass = () => {
            if (!lineHeight || lineHeight === "normal") return ""
            if (lineHeight === "tight") return "leading-tight"
            if (lineHeight === "relaxed") return "leading-relaxed"
            if (lineHeight === "loose") return "leading-loose"
            return ""
          }

          const getLetterSpacingClass = () => {
            if (!letterSpacing || letterSpacing === "normal") return ""
            if (letterSpacing === "tight") return "tracking-tight"
            if (letterSpacing === "wide") return "tracking-wide"
            if (letterSpacing === "wider") return "tracking-wider"
            return ""
          }

          // fontSize overrides size if specified
          const finalSizeClass = fontSize ? getFontSizeClass() : getSizeClass()

          return (
            <p
              className={`
                ${getAlignClass()}
                ${finalSizeClass}
                ${getFontWeightClass()}
                ${getTextTransformClass()}
                ${getLineHeightClass()}
                ${getLetterSpacingClass()}
              `.trim().replace(/\s+/g, ' ')}
              style={{ color: color || undefined }}
            >
              {text}
            </p>
          )
        },
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
          },
          fontSize: {
            type: "select",
            label: "Font Size (Advanced)",
            options: [
              { label: "Default", value: "" },
              { label: "Extra Small", value: "xs" },
              { label: "Small", value: "sm" },
              { label: "Base", value: "base" },
              { label: "Large", value: "lg" },
              { label: "XL", value: "xl" },
              { label: "2XL", value: "2xl" },
              { label: "3XL", value: "3xl" }
            ]
          },
          fontWeight: {
            type: "select",
            label: "Font Weight",
            options: [
              { label: "Default", value: "" },
              { label: "Normal", value: "normal" },
              { label: "Medium", value: "medium" },
              { label: "Semibold", value: "semibold" },
              { label: "Bold", value: "bold" },
              { label: "Extra Bold", value: "extrabold" }
            ]
          },
          color: { type: "text", label: "Text Color (hex or CSS)" },
          textTransform: {
            type: "select",
            label: "Text Transform",
            options: [
              { label: "None", value: "none" },
              { label: "Uppercase", value: "uppercase" },
              { label: "Lowercase", value: "lowercase" },
              { label: "Capitalize", value: "capitalize" }
            ]
          },
          lineHeight: {
            type: "select",
            label: "Line Height",
            options: [
              { label: "Normal", value: "normal" },
              { label: "Tight", value: "tight" },
              { label: "Relaxed", value: "relaxed" },
              { label: "Loose", value: "loose" }
            ]
          },
          letterSpacing: {
            type: "select",
            label: "Letter Spacing",
            options: [
              { label: "Normal", value: "normal" },
              { label: "Tight", value: "tight" },
              { label: "Wide", value: "wide" },
              { label: "Wider", value: "wider" }
            ]
          }
        },
        defaultProps: {
          text: "Enter text here...",
          align: "left",
          size: "medium",
          textTransform: "none",
          lineHeight: "normal",
          letterSpacing: "normal"
        }
      },
      Image: {
        render: (props) => {
          const {
            src,
            alt = "",
            width = "full",
            height,
            objectFit = "cover",
            rounded = "md"
          } = props

          const getWidthClass = () => {
            if (width === "full") return "w-full"
            if (width === "auto") return "w-auto"
            if (width === "small") return "w-48"
            if (width === "medium") return "w-64"
            if (width === "large") return "w-96"
            return "w-full"
          }

          const getRoundedClass = () => {
            if (rounded === "none") return ""
            if (rounded === "sm") return "rounded-sm"
            if (rounded === "md") return "rounded-md"
            if (rounded === "lg") return "rounded-lg"
            if (rounded === "xl") return "rounded-xl"
            if (rounded === "full") return "rounded-full"
            return "rounded-md"
          }

          const getObjectFitClass = () => {
            if (objectFit === "cover") return "object-cover"
            if (objectFit === "contain") return "object-contain"
            if (objectFit === "fill") return "object-fill"
            if (objectFit === "none") return "object-none"
            return "object-cover"
          }

          return (
            <div className="flex justify-center">
              <img
                src={src || "/placeholder.svg"}
                alt={alt}
                className={`${getWidthClass()} ${getRoundedClass()} ${getObjectFitClass()}`}
                style={{ height: height ? `${height}px` : "auto" }}
              />
            </div>
          )
        },
        fields: {
          src: { type: "text", label: "Image URL" },
          alt: { type: "text", label: "Alt Text" },
          width: {
            type: "select",
            label: "Width",
            options: [
              { label: "Full Width", value: "full" },
              { label: "Auto", value: "auto" },
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" }
            ]
          },
          height: { type: "number", label: "Height (px, optional)" },
          objectFit: {
            type: "select",
            label: "Object Fit",
            options: [
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Fill", value: "fill" },
              { label: "None", value: "none" }
            ]
          },
          rounded: {
            type: "select",
            label: "Border Radius",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
              { label: "Full", value: "full" }
            ]
          }
        },
        defaultProps: {
          src: "/placeholder.svg",
          alt: "Image",
          width: "full",
          objectFit: "cover",
          rounded: "md"
        }
      },
      ImageCard: {
        render: (props) => {
          const {
            src,
            alt = "",
            title,
            description,
            overlay = false,
            overlayColor = "rgba(0, 0, 0, 0.5)",
            textAlign = "center",
            height = 400
          } = props

          const getAlignClass = () => {
            if (textAlign === "left") return "text-left items-start"
            if (textAlign === "center") return "text-center items-center"
            if (textAlign === "right") return "text-right items-end"
            return "text-center items-center"
          }

          return (
            <div className="relative rounded-xl overflow-hidden" style={{ height: `${height}px` }}>
              <img
                src={src || "/placeholder.svg"}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {overlay && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayColor }}
                />
              )}
              {(title || description) && (
                <div className={`relative z-10 h-full flex flex-col justify-center p-8 ${getAlignClass()}`}>
                  {title && (
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-lg text-white/90 max-w-2xl">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        },
        fields: {
          src: { type: "text", label: "Image URL" },
          alt: { type: "text", label: "Alt Text" },
          title: { type: "text", label: "Title (optional)" },
          description: { type: "textarea", label: "Description (optional)" },
          overlay: {
            type: "radio",
            label: "Show Overlay",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false }
            ]
          },
          overlayColor: { type: "text", label: "Overlay Color (CSS)" },
          textAlign: {
            type: "radio",
            label: "Text Alignment",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" }
            ]
          },
          height: { type: "number", label: "Height (px)", min: 200, max: 800 }
        },
        defaultProps: {
          src: "/placeholder.svg",
          alt: "Image Card",
          overlay: true,
          overlayColor: "rgba(0, 0, 0, 0.5)",
          textAlign: "center",
          height: 400
        }
      }
    }
  }
}
