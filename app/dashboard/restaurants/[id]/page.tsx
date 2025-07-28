"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Edit,
  QrCode,
  Eye,
  Upload,
  MoreHorizontal,
  MapPin,
  Phone,
  Globe,
  Clock,
  Menu as MenuIcon,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiClient, type Restaurant } from "@/lib/api"

interface MenuWithDetails {
  id: string;
  restaurant_id: string;
  name: string;
  qr_code_url?: string;
  qr_code_data?: string;
  template_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: string;
    name: string;
    description?: string;
    address?: any;
    contact_info?: any;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  stats: {
    total_items: number;
    active_items: number;
    categories: string[];
    average_price?: number;
    last_updated: string;
  };
  image?: string;
}

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewlyCreated = searchParams.get("created") === "true"
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menus, setMenus] = useState<MenuWithDetails[]>([])
  const [analytics, setAnalytics] = useState({ qrScans: 0, totalViews: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(isNewlyCreated)
  const [menusLoaded, setMenusLoaded] = useState(false)
  const [loadAttempts, setLoadAttempts] = useState(0)

  // Resolve params promise
  useEffect(() => {
    console.log("useEffect1")
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  const loadMenus = useCallback(async (restaurantId: string) => {
    if (!restaurantId) return
    
    // Prevent multiple simultaneous calls
    if (isLoadingMenus) {
      console.log("Already loading menus, skipping...")
      return
    }
    
    setIsLoadingMenus(true)
    try {
      // Get all menus with details in a single request
      const response = await apiClient.getRestaurantMenusWithDetails(restaurantId)
      
      if (response.error) {
        console.error("Failed to load menus:", response.error)
        setMenus([])
        return
      }
      
      if (response.data) {
        setMenus(response.data.menus)
        
        // Load analytics for this restaurant
        try {
          const analyticsResponse = await apiClient.getAnalyticsOverview(restaurantId)
          if (analyticsResponse.data?.data) {
            setAnalytics({
              qrScans: analyticsResponse.data.data.total_qr_scans,
              totalViews: analyticsResponse.data.data.total_views
            })
          }
        } catch (analyticsError) {
          console.error("Error loading analytics:", analyticsError)
        }
      } else {
        setMenus([])
      }
    } catch (err) {
      console.error("Error loading menus:", err)
      setMenus([])
    } finally {
      setIsLoadingMenus(false)
    }
  }, [isLoadingMenus])

  useEffect(() => {
    console.log("useEffect2")
    let isMounted = true
    
    // Reset menus loaded flag when restaurant ID changes
    setMenusLoaded(false)
    setMenus([])
    setLoadAttempts(0)
    
    const fetchRestaurant = async () => {
      if (!resolvedParams?.id) return
      
      setIsLoading(true)
      setError("")
      
      try {
        console.log("Fetching restaurant with ID:", resolvedParams.id)
        const response = await apiClient.getRestaurant(resolvedParams.id)
        console.log("Restaurant API response:", response)
        
        if (!isMounted) return
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setRestaurant(response.data)
          // Load menus for this restaurant only if not already loaded or loading, and max attempts not reached
          if (!menusLoaded && !isLoadingMenus && loadAttempts < 3) {
            setLoadAttempts(prev => prev + 1)
            await loadMenus(response.data.id)
            setMenusLoaded(true)
          }
        }
      } catch (err) {
        if (!isMounted) return
        setError("Failed to load restaurant. Please try again.")
        console.error("Error fetching restaurant:", err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchRestaurant()

    // Clear success message after 5 seconds
    if (isNewlyCreated) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setShowSuccess(false)
        }
      }, 5000)
      return () => {
        clearTimeout(timer)
        isMounted = false
      }
    }
    
    return () => {
      isMounted = false
    }
  }, [resolvedParams?.id, isNewlyCreated])

  const generateQRCode = async () => {
    // Find the active menu
    const activeMenu = menus.find(menu => menu.is_active)
    
    if (!activeMenu) {
      alert("No active menu found. Please ensure a menu is marked as active.")
      return
    }

    try {
      // Check if QR code already exists for this menu
      let qrCodeUrl = activeMenu.qr_code_url
      
      if (!qrCodeUrl) {
        // Generate QR code if it doesn't exist
        const generateResponse = await apiClient.generateQRCode(activeMenu.id)
        if (generateResponse.error) {
          alert(`Failed to generate QR code: ${generateResponse.error}`)
          return
        }
        if (!generateResponse.data) {
          alert("Failed to generate QR code: No data returned")
          return
        }
        qrCodeUrl = generateResponse.data.qr_code_url
      }

      if (qrCodeUrl) {
        // Extract filename from the QR code URL
        const urlParts = qrCodeUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Download the QR code using the API client
        const response = await apiClient.downloadQRCode(filename)
        
        if (!response.ok) {
          alert("Failed to download QR code")
          return
        }
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${restaurant?.name}-qr-code.png`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert("QR code URL not found")
      }
    } catch (error) {
      console.error("Error downloading QR code:", error)
      alert("Failed to download QR code. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <Alert>
            <AlertDescription>Restaurant not found.</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Restaurant created successfully! You can now upload menus and generate QR codes.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/restaurants">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Restaurants
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                  {restaurant.is_active ? "active" : "inactive"}
                </Badge>
              </div>
              <p className="text-gray-600">{restaurant.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/menus?restaurant=${restaurant.id}`}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Menus
              </Button>
            </Link>
            <Button onClick={generateQRCode}>
              <QrCode className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Restaurant
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Menu
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Restaurant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MenuIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Active Menus</p>
                      <p className="text-2xl font-bold">{menus.filter(m => m.is_active).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">QR Scans</p>
                      <p className="text-2xl font-bold">{analytics.qrScans.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Chat Sessions</p>
                      <p className="text-2xl font-bold">456</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Avg Rating</p>
                      <p className="text-2xl font-bold">4.8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Restaurant Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        {restaurant.address?.street || "No address provided"}
                        {restaurant.address?.city && `, ${restaurant.address.city}`}
                        {restaurant.address?.state && `, ${restaurant.address.state}`}
                        {restaurant.address?.zipCode && ` ${restaurant.address.zipCode}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{restaurant.contact_info?.phone || "No phone provided"}</p>
                    </div>
                  </div>
                  {restaurant.contact_info?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a href={restaurant.contact_info.website} className="text-sm text-blue-600 hover:underline">
                          {restaurant.contact_info.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {restaurant.contact_info?.email && (
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 text-gray-400">✉️</span>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600">{restaurant.contact_info.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-gray-600">{new Date(restaurant.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/dashboard/menus/upload?restaurant=${restaurant.id}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Menu
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={generateQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                  <Link href={`/dashboard/menus?restaurant=${restaurant.id}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      View Restaurant Menus
                    </Button>
                  </Link>
                  <Link href={`/dashboard/restaurants/${restaurant.id}/edit`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Restaurant Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menus" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Menus</h3>
                <p className="text-gray-600">Manage your restaurant's menus</p>
              </div>
              <Link href={`/dashboard/menus/upload?restaurant=${restaurant.id}`}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Menu
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingMenus ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading menus...</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No menus found</h3>
                  <p className="text-gray-600 mb-4">This restaurant doesn't have any menus yet.</p>
                  <Link href={`/dashboard/menus/upload?restaurant=${restaurant?.id}`}>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Menu
                    </Button>
                  </Link>
                </div>
              ) : (
                menus.map((menu) => (
                <Card key={menu.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={menu.image || "/placeholder.svg"}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={menu.is_active ? "default" : "secondary"}>
                        {menu.is_active ? "active" : "inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <CardDescription>
                      {restaurant?.description || "Restaurant menu"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{menu.stats?.total_items || 0} items</span>
                      <span>Updated {new Date(menu.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={menu.qr_code_data || `/dashboard/menus/${menu.id}/qr`} className="flex-1" target={menu.qr_code_data ? "_blank" : "_self"}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          {menu.qr_code_data ? "View" : "Generate QR"}
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Analytics</CardTitle>
                <CardDescription>Performance metrics for {restaurant.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
                <CardDescription>Configure settings for {restaurant.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
