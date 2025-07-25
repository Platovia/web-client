"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Menu, QrCode, MessageCircle, TrendingUp, Eye, Plus, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"

// Dummy data
const dashboardStats = {
  totalRestaurants: 3,
  totalMenus: 8,
  totalQRScans: 1247,
  totalChatInteractions: 892,
  monthlyGrowth: 23.5,
}

const recentActivity = [
  { action: "New menu uploaded", restaurant: "Bella Vista Italian", time: "2 hours ago" },
  { action: "QR code generated", restaurant: "Tokyo Sushi Bar", time: "4 hours ago" },
  { action: "Menu items updated", restaurant: "Mountain Grill", time: "1 day ago" },
  { action: "Customer chat session", restaurant: "Bella Vista Italian", time: "2 days ago" },
]

export default function DashboardPage() {
  const { user, companies } = useAuth()
  // Add state for welcome message
  const [showWelcome, setShowWelcome] = useState(false)
  const [recentRestaurants, setRecentRestaurants] = useState([
    {
      id: "1",
      name: "Bella Vista Italian",
      description: "Authentic Italian cuisine",
      status: "active",
      menus: 3,
      qrScans: 456,
      lastUpdated: "2 hours ago",
    },
    {
      id: "2",
      name: "Tokyo Sushi Bar",
      description: "Fresh sushi and Japanese dishes",
      status: "active",
      menus: 2,
      qrScans: 321,
      lastUpdated: "1 day ago",
    },
    {
      id: "3",
      name: "Mountain Grill",
      description: "American steakhouse",
      status: "draft",
      menus: 1,
      qrScans: 89,
      lastUpdated: "3 days ago",
    },
  ])

  // Get the primary company
  const primaryCompany = companies?.[0]

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isWelcome = urlParams.get("welcome") === "true"

    setShowWelcome(isWelcome)

    // Clear welcome parameter
    if (isWelcome) {
      window.history.replaceState({}, "", "/dashboard")
    }

    // Check for first restaurant from onboarding (legacy localStorage)
    const firstRestaurant = localStorage.getItem("firstRestaurant")
    if (firstRestaurant) {
      try {
        const restaurant = JSON.parse(firstRestaurant)
        setRecentRestaurants((prev) => [
          {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            status: "active",
            menus: 0,
            qrScans: 0,
            lastUpdated: "Just created",
          },
          ...prev.slice(0, 2), // Keep only 3 total
        ])
        // Clear the localStorage item after using it
        localStorage.removeItem("firstRestaurant")
      } catch (error) {
        console.error("Error parsing first restaurant:", error)
      }
    }
  }, [])

  const firstName = user?.first_name || "there"
  const companyName = primaryCompany?.name || "your company"

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {showWelcome && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎉 Welcome to MenuAI, {firstName}!</h2>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with {companyName}.</p>
          </div>
          <Link href="/dashboard/restaurants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Menus</CardTitle>
              <Menu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalMenus}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalQRScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth}% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Interactions</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalChatInteractions}</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Restaurants */}
          <Card>
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
              {recentRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{restaurant.name}</h4>
                      <Badge variant={restaurant.status === "active" ? "default" : "secondary"}>
                        {restaurant.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{restaurant.menus} menus</span>
                      <span>{restaurant.qrScans} scans</span>
                      <span>Updated {restaurant.lastUpdated}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/restaurants/${restaurant.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.restaurant}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/restaurants/new">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Store className="h-6 w-6" />
                  Add New Restaurant
                </Button>
              </Link>
              <Link href="/dashboard/menus/upload">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Menu className="h-6 w-6" />
                  Upload Menu
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <TrendingUp className="h-6 w-6" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
