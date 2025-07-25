"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Upload, QrCode, Download } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

// Dummy menu data
const dummyMenus = [
  {
    id: "menu-1",
    name: "Main Menu",
    restaurant: "Bella Vista Italian",
    restaurantId: "1",
    description: "Our complete dining menu with appetizers, mains, and desserts",
    items: 24,
    lastUpdated: "2 hours ago",
    status: "active",
    image: "/placeholder.svg?height=200&width=300",
    views: 1247,
    qrScans: 456,
  },
  {
    id: "menu-2",
    name: "Lunch Specials",
    restaurant: "Bella Vista Italian",
    restaurantId: "1",
    description: "Weekday lunch offerings with quick service options",
    items: 12,
    lastUpdated: "1 day ago",
    status: "active",
    image: "/placeholder.svg?height=200&width=300",
    views: 892,
    qrScans: 234,
  },
  {
    id: "menu-3",
    name: "Sushi Selection",
    restaurant: "Tokyo Sushi Bar",
    restaurantId: "2",
    description: "Fresh sushi, sashimi, and specialty rolls",
    items: 18,
    lastUpdated: "3 days ago",
    status: "active",
    image: "/placeholder.svg?height=200&width=300",
    views: 654,
    qrScans: 189,
  },
  {
    id: "menu-4",
    name: "Wine List",
    restaurant: "Mountain Grill",
    restaurantId: "3",
    description: "Curated wine selection with tasting notes",
    items: 8,
    lastUpdated: "1 week ago",
    status: "draft",
    image: "/placeholder.svg?height=200&width=300",
    views: 123,
    qrScans: 45,
  },
]

export default function MenusPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMenus, setFilteredMenus] = useState(dummyMenus)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = dummyMenus.filter(
      (menu) =>
        menu.name.toLowerCase().includes(query.toLowerCase()) ||
        menu.restaurant.toLowerCase().includes(query.toLowerCase()) ||
        menu.description.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredMenus(filtered)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menus</h1>
            <p className="text-gray-600">Manage all your restaurant menus</p>
          </div>
          <Link href="/dashboard/menus/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Menu
            </Button>
          </Link>
        </div>

        {/* Search and Stats */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📋</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Menus</p>
                  <p className="text-2xl font-bold">{dummyMenus.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Menus</p>
                  <p className="text-2xl font-bold">{dummyMenus.filter((m) => m.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">{dummyMenus.reduce((sum, m) => sum + m.views, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">QR Scans</p>
                  <p className="text-2xl font-bold">{dummyMenus.reduce((sum, m) => sum + m.qrScans, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <Card key={menu.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img src={menu.image || "/placeholder.svg"} alt={menu.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Badge variant={menu.status === "active" ? "default" : "secondary"}>{menu.status}</Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{menu.restaurant}</p>
                    <CardDescription className="mt-1">{menu.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Menu
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Menu
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Export Menu
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{menu.items} items</span>
                  <span className="text-gray-500">Updated {menu.lastUpdated}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{menu.views}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{menu.qrScans}</p>
                    <p className="text-xs text-gray-600">QR Scans</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/menu/${menu.restaurantId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/menus/${menu.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMenus.length === 0 && (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menus found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Get started by uploading your first menu"}
            </p>
            <Link href="/dashboard/menus/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Menu
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
