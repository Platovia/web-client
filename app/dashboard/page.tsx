"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Menu, QrCode, MessageCircle, Eye, Plus, ArrowUpRight } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Restaurant } from "@/lib/api"

// Initial data structure - will be populated from API
const initialDashboardStats = {
  totalRestaurants: 0,
  totalMenus: 0,
  totalQRScans: 0,
  totalChatInteractions: 0,
}


export default function DashboardPage() {
  const { user, companies } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)
  const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>([])
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Get the primary company
  const primaryCompany = companies?.[0]

  // Stable dependency: use company ID string instead of companies array reference
  const primaryCompanyId = companies?.[0]?.id

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!primaryCompanyId) return

      setIsLoading(true)
      setError("")

      try {
        const response = await apiClient.getCompanyRestaurants(primaryCompanyId)
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          // Show only the most recent 3 restaurants
          setRecentRestaurants(response.data.restaurants.slice(0, 3))
          
          // Load analytics data
          try {
            const [analyticsResponse, chatResponse] = await Promise.all([
              apiClient.getAnalyticsOverview(),
              apiClient.getChatAnalytics()
            ])
            
            if (analyticsResponse.data?.data) {
              const chatData = chatResponse.data?.data || {}
              setDashboardStats({
                totalRestaurants: response.data.restaurants.length,
                totalMenus: analyticsResponse.data.data.total_menus,
                totalQRScans: analyticsResponse.data.data.total_qr_scans,
                totalChatInteractions: chatData.total_sessions || 0,
              })
            }
          } catch (analyticsError) {
            console.error("Error loading analytics:", analyticsError)
            // Set basic stats without analytics
            setDashboardStats({
              totalRestaurants: response.data.restaurants.length,
              totalMenus: 0,
              totalQRScans: 0,
              totalChatInteractions: 0,
            })
          }
        }
      } catch (err) {
        setError("Failed to load restaurants. Please try again.")
        console.error("Error fetching restaurants:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRestaurants()
  }, [primaryCompanyId])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isWelcome = urlParams.get("welcome") === "true"

    setShowWelcome(isWelcome)

    // Clear welcome parameter
    if (isWelcome) {
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [])

  const firstName = user?.first_name || "there"
  const companyName = primaryCompany?.name || "your company"

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {showWelcome && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Platovia, {firstName}!</h2>
                <p className="text-blue-100">
                  Your account has been set up successfully. You can now start uploading menus and generating QR codes.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowWelcome(false)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Got it!
              </Button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{greeting}, {firstName}</h1>
            <p className="text-muted-foreground">{formattedDate} &middot; Here&apos;s what&apos;s happening with {companyName}.</p>
          </div>
          <Link href="/dashboard/restaurants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              + Create New Restaurant
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Restaurants"
            value={isLoading ? "..." : dashboardStats.totalRestaurants}
            icon={Store}
            sparklineData={[1, 1, 2, 2, 3, 3, 4]}
          />
          <StatCard
            title="Active Menus"
            value={dashboardStats.totalMenus}
            icon={Menu}
            trend={{ value: "Active", positive: true }}
            sparklineData={[2, 3, 3, 4, 5, 5, 6]}
          />
          <StatCard
            title="Total QR Scans"
            value={dashboardStats.totalQRScans.toLocaleString()}
            icon={QrCode}
            sparklineData={[10, 18, 15, 22, 28, 25, 35]}
          />
          <StatCard
            title="AI Chat Interactions"
            value={dashboardStats.totalChatInteractions}
            icon={MessageCircle}
            trend={{ value: "+18%", positive: true }}
            sparklineData={[3, 5, 4, 7, 6, 8, 12]}
          />
        </div>

          {/* Recent Restaurants */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Restaurants</CardTitle>
                <Link href="/dashboard/restaurants">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-8 bg-muted rounded"></div>
                  </div>
                ))
              ) : recentRestaurants.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No restaurants yet</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first restaurant location</p>
                  <Link href="/dashboard/restaurants/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Restaurant
                    </Button>
                  </Link>
                </div>
              ) : (
                recentRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                          {restaurant.is_active ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{restaurant.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {new Date(restaurant.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Link href={`/dashboard/restaurants/${restaurant.id}?tab=menus`} className="text-xs text-primary hover:underline font-medium">
                          Menu
                        </Link>
                        <Link href={`/dashboard/restaurants/${restaurant.id}?tab=analytics`} className="text-xs text-primary hover:underline font-medium">
                          Analytics
                        </Link>
                      </div>
                    </div>
                    <Link href={`/dashboard/restaurants/${restaurant.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  )
}
