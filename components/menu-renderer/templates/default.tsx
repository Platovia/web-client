"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { formatPrice } from "@/lib/currency"
import { resolveImageUrl } from "@/lib/utils"
import type { MenuRendererProps } from "../types"

export default function DefaultMenuTemplate(props: MenuRendererProps) {
  const { restaurant, items, themeConfig, categories, selectedCategory, onChangeCategory, searchQuery, onChangeSearch } = props

  const densityClass = themeConfig?.layout?.density === "compact" ? "gap-4" : "gap-6"

  return (
    <div className="min-h-screen" style={{ background: "var(--menu-color-background)" }}>
      <div className="bg-white shadow-sm border-b" style={{ background: "var(--menu-color-surface)" }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {restaurant?.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name || "Restaurant"} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200" />
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--menu-color-text)" }}>{restaurant?.name}</h1>
              {restaurant?.description && (
                <p className="text-gray-600">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search menu items..." value={searchQuery} onChange={(e) => onChangeSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["All", ...categories].map((category) => (
              <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => onChangeCategory(category)} className="whitespace-nowrap">
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${densityClass}`}>
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow" style={{ borderRadius: "var(--menu-radius-card)" }}>
              <CardHeader className="pb-2">
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <span className="text-lg font-bold" style={{ color: "var(--menu-color-price)" }}>
                        {formatPrice(item.price, restaurant?.currency_code, restaurant?.locale)}
                      </span>
                    </div>
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </div>
                  {item.image_url && (
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={resolveImageUrl(item.image_url) || "/placeholder.jpg"} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.category && <Badge variant="secondary">{item.category}</Badge>}
                  {item.tags?.slice(0, 5).map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}


