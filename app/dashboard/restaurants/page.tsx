"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Store, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, QrCode, Menu, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

// Dummy data
const restaurants = [
  {
    id: "1",
    name: "Bella Vista Italian",
    description: "Authentic Italian cuisine with a modern twist",
    address: "123 Main St, Downtown",
    phone: "(555) 123-4567",
    cuisine: "Italian",
    status: "active",
    menus: 3,
    qrScans: 456,
    chatInteractions: 234,
    lastUpdated: "2 hours ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    name: "Tokyo Sushi Bar",
    description: "Fresh sushi and Japanese dishes",
    address: "456 Oak Ave, Midtown",
    phone: "(555) 987-6543",
    cuisine: "Japanese",
    status: "active",
    menus: 2,
    qrScans: 321,
    chatInteractions: 189,
    lastUpdated: "1 day ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "Mountain Grill",
    description: "American steakhouse with premium cuts",
    address: "789 Pine Rd, Uptown",
    phone: "(555) 456-7890",
    cuisine: "American",
    status: "draft",
    menus: 1,
    qrScans: 89,
    chatInteractions: 45,
    lastUpdated: "3 days ago",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    name: "Spice Garden",
    description: "Authentic Indian and Thai cuisine",
    address: "321 Elm St, Eastside",
    phone: "(555) 234-5678",
    cuisine: "Indian/Thai",
    status: "active",
    menus: 4,
    qrScans: 678,
    chatInteractions: 412,
    lastUpdated: "5 hours ago",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredRestaurants(filtered)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
            <p className="text-gray-600">Manage all your restaurant locations</p>
          </div>
          <Link href="/dashboard/restaurants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search restaurants..."
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
                <Store className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Restaurants</p>
                  <p className="text-2xl font-bold">{restaurants.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Menu className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Menus</p>
                  <p className="text-2xl font-bold">{restaurants.reduce((sum, r) => sum + r.menus, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">QR Scans</p>
                  <p className="text-2xl font-bold">{restaurants.reduce((sum, r) => sum + r.qrScans, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💬</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chat Sessions</p>
                  <p className="text-2xl font-bold">{restaurants.reduce((sum, r) => sum + r.chatInteractions, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={restaurant.status === "active" ? "default" : "secondary"}>{restaurant.status}</Badge>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <CardDescription className="mt-1">{restaurant.description}</CardDescription>
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
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Restaurant
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
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
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{restaurant.phone}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{restaurant.cuisine}</Badge>
                  <span className="text-gray-500">Updated {restaurant.lastUpdated}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{restaurant.menus}</p>
                    <p className="text-xs text-gray-600">Menus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{restaurant.qrScans}</p>
                    <p className="text-xs text-gray-600">QR Scans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{restaurant.chatInteractions}</p>
                    <p className="text-xs text-gray-600">Chats</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/menu/${restaurant.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View Menu
                    </Button>
                  </Link>
                  <Link href={`/dashboard/restaurants/${restaurant.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Get started by adding your first restaurant"}
            </p>
            <Link href="/dashboard/restaurants/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
