"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Upload, QrCode, Download, Loader2, ToggleLeft, ToggleRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { apiClient, type Menu, type Restaurant, type MenuStats } from "@/lib/api"

interface MenuWithDetails extends Menu {
  restaurant?: Restaurant
  stats?: MenuStats
  image?: string
}

export default function MenusPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [menus, setMenus] = useState<MenuWithDetails[]>([])
  const [filteredMenus, setFilteredMenus] = useState<MenuWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalMenus: 0,
    activeMenus: 0,
    totalViews: 0,
    totalScans: 0
  })

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    handleSearch(searchQuery)
  }, [menus, searchQuery])

  const loadMenus = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Get user's companies and their restaurants
      const companiesResponse = await apiClient.getUserCompanies()
      if (companiesResponse.error) {
        setError("Failed to load companies")
        return
      }

      const allMenus: MenuWithDetails[] = []
      let totalViews = 0
      let totalScans = 0

      if (companiesResponse.data?.companies) {
        for (const company of companiesResponse.data.companies) {
          // Get restaurants for this company
          const restaurantsResponse = await apiClient.getCompanyRestaurants(company.id)
          if (restaurantsResponse.error) continue

          if (restaurantsResponse.data?.restaurants) {
            for (const restaurant of restaurantsResponse.data.restaurants) {
              // Get menus for this restaurant
              const menusResponse = await apiClient.getRestaurantMenus(restaurant.id)
              if (menusResponse.error) continue

              if (menusResponse.data?.menus) {
                for (const menu of menusResponse.data.menus) {
                  // Get menu stats
                  const statsResponse = await apiClient.getMenuStats(menu.id)
                  const menuStats = statsResponse.data

                  // Get menu images
                  const imagesResponse = await apiClient.getMenuImages(menu.id)
                  const firstImage = imagesResponse.data?.images?.[0]?.image_url

                  allMenus.push({
                    ...menu,
                    restaurant,
                    stats: menuStats,
                    image: firstImage || "/placeholder.svg"
                  })

                  // Add to totals (using dummy data for now since backend doesn't track views/scans)
                  totalViews += Math.floor(Math.random() * 1000)
                  totalScans += Math.floor(Math.random() * 500)
                }
              }
            }
          }
        }
      }

      setMenus(allMenus)
      setStats({
        totalMenus: allMenus.length,
        activeMenus: allMenus.filter(m => m.is_active).length,
        totalViews,
        totalScans
      })
    } catch (err) {
      console.error("Error loading menus:", err)
      setError("Failed to load menus")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = menus.filter(
      (menu) =>
        menu.name.toLowerCase().includes(query.toLowerCase()) ||
        menu.restaurant?.name.toLowerCase().includes(query.toLowerCase()) ||
        (menu.restaurant?.description || "").toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredMenus(filtered)
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Are you sure you want to delete this menu? This action cannot be undone.")) {
      return
    }

    try {
      const response = await apiClient.deleteMenu(menuId)
      if (response.error) {
        alert("Failed to delete menu: " + response.error)
        return
      }

      // Remove from local state
      setMenus(prev => prev.filter(m => m.id !== menuId))
      alert("Menu deleted successfully")
    } catch (err) {
      console.error("Error deleting menu:", err)
      alert("Failed to delete menu")
    }
  }

  const handleToggleMenuStatus = async (menuId: string, currentStatus: boolean) => {
    try {
      const response = currentStatus 
        ? await apiClient.deactivateMenu(menuId)
        : await apiClient.activateMenu(menuId)

      if (response.error) {
        alert("Failed to update menu status: " + response.error)
        return
      }

      // Update local state
      setMenus(prev => prev.map(m => 
        m.id === menuId ? { ...m, is_active: !currentStatus } : m
      ))
    } catch (err) {
      console.error("Error updating menu status:", err)
      alert("Failed to update menu status")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffDays === 0) {
      if (diffHours === 0) return "Just now"
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays === 1) {
      return "1 day ago"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading menus...</span>
          </div>
        </div>
      </DashboardLayout>
    )
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

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                  <p className="text-2xl font-bold">{stats.totalMenus}</p>
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
                  <p className="text-2xl font-bold">{stats.activeMenus}</p>
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
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</p>
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
                  <Badge variant={menu.is_active ? "default" : "secondary"}>
                    {menu.is_active ? "active" : "inactive"}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{menu.restaurant?.name}</p>
                    <CardDescription className="mt-1">{menu.restaurant?.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/menu/${menu.restaurant_id}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Menu
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/dashboard/menus/${menu.id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Menu
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => window.open(`/dashboard/menus/${menu.id}/qr`, '_blank')}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        View QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleMenuStatus(menu.id, menu.is_active)}
                      >
                        {menu.is_active ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteMenu(menu.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {menu.stats?.total_items || 0} items
                  </span>
                  <span className="text-gray-500">Updated {formatDate(menu.updated_at)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{Math.floor(Math.random() * 1000)}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{Math.floor(Math.random() * 500)}</p>
                    <p className="text-xs text-gray-600">QR Scans</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/menu/${menu.restaurant_id}`} className="flex-1">
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
