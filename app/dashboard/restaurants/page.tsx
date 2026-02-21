"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, QrCode, Menu, MapPin, Phone, Loader2 } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Restaurant } from "@/lib/api"

export default function RestaurantsPage() {
  const { companies } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!companies || companies.length === 0) return
      
      setIsLoading(true)
      setError("")
      
      try {
        const company = companies[0] // Use the first company
        const response = await apiClient.getCompanyRestaurants(company.id)
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setRestaurants(response.data.restaurants)
          setFilteredRestaurants(response.data.restaurants)
        }
      } catch (err) {
        setError("Failed to load restaurants. Please try again.")
        console.error("Error fetching restaurants:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRestaurants()
  }, [companies])

  // Filter restaurants based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants)
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRestaurants(filtered)
    }
  }, [restaurants, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    if (!confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await apiClient.deleteRestaurant(restaurant.id)
      
      if (response.error) {
        setError(`Failed to delete restaurant: ${response.error}`)
      } else {
        // Remove from local state
        setRestaurants(prev => prev.filter(r => r.id !== restaurant.id))
        setFilteredRestaurants(prev => prev.filter(r => r.id !== restaurant.id))
      }
    } catch (err) {
      setError("Failed to delete restaurant. Please try again.")
      console.error("Error deleting restaurant:", err)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Restaurants</h1>
            <p className="text-muted-foreground">Manage all your restaurant locations</p>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Restaurants</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{restaurants.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Menu className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Restaurants</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{restaurants.filter(r => r.is_active).length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Created This Month</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {restaurants.filter(r => {
                        const createdDate = new Date(r.created_at)
                        const now = new Date()
                        return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{restaurants.filter(r => !r.is_active).length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRestaurants.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? "No restaurants found" : "No restaurants yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "Get started by adding your first restaurant location"}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/restaurants/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurant
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Store className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                      {restaurant.is_active ? "active" : "inactive"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/dashboard/restaurants/${restaurant.id}`}>
                        <CardTitle className="text-lg hover:underline cursor-pointer">{restaurant.name}</CardTitle>
                      </Link>
                      <CardDescription className="mt-1">{restaurant.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/restaurants/${restaurant.id}`}>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/restaurants/${restaurant.id}/edit`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Restaurant
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteRestaurant(restaurant)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {restaurant.address?.street || "No address provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{restaurant.contact_info?.phone || "No phone provided"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">
                      {restaurant.contact_info?.cuisine || "Cuisine not specified"}
                    </Badge>
                    <span className="text-muted-foreground">
                      Created {new Date(restaurant.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Link href={`/dashboard/restaurants/${restaurant.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/restaurants/${restaurant.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
            </Card>
          )))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No restaurants found</h3>
            <p className="text-muted-foreground mb-4">
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
