"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, MessageCircle, QrCode, Eye, Clock, Star } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { apiClient } from "@/lib/api"

// Initial analytics data structure
const initialAnalyticsData = {
  overview: {
    totalViews: 0,
    totalScans: 0,
    totalChats: 0,
    avgSessionTime: "0m 0s",
    conversionRate: 0,
    customerSatisfaction: 0,
  },
  topRestaurants: [],
  popularMenuItems: [],
  chatInsights: [],
  weeklyStats: [],
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalViews: 0,
      totalScans: 0,
      totalChats: 0,
      avgSessionTime: "0m 0s",
      conversionRate: 0,
      customerSatisfaction: 0,
      avgMessagesPerSession: 0,
    },
    topRestaurants: [],
    chatInsights: [],
    weeklyStats: [],
    peakHours: "No data available",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      setError("")
      
      try {
        const [overviewResponse, chatResponse] = await Promise.all([
          apiClient.getAnalyticsOverview(),
          apiClient.getChatAnalytics()
        ])
        
        if (overviewResponse.error) {
          setError(overviewResponse.error)
        } else if (overviewResponse.data?.data) {
          const chatData = chatResponse.data?.data || {}
          const avgSessionDuration = chatData.avg_session_duration_minutes || 0
          const formatSessionTime = (minutes: number) => {
            if (minutes < 60) {
              return `${Math.round(minutes)}m`
            }
            const hours = Math.floor(minutes / 60)
            const remainingMinutes = Math.round(minutes % 60)
            return `${hours}h ${remainingMinutes}m`
          }
          
          setAnalyticsData({
            overview: {
              totalViews: overviewResponse.data.data.total_views,
              totalScans: overviewResponse.data.data.total_qr_scans,
              totalChats: chatData.total_sessions || 0,
              avgSessionTime: formatSessionTime(avgSessionDuration),
              conversionRate: 0, // TODO: Add conversion rate analytics
              customerSatisfaction: 0, // TODO: Add satisfaction analytics
              avgMessagesPerSession: chatData.avg_messages_per_session || 0,
            },
            topRestaurants: overviewResponse.data.data.top_menus || [],
            chatInsights: chatData.top_queries || [],
            weeklyStats: overviewResponse.data.data.weekly_stats || [],
            peakHours: overviewResponse.data.data.peak_hours || "No data available",
          })
        }
      } catch (err) {
        console.error("Error loading analytics:", err)
        setError("Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  // Calculate max values for progress bars
  const maxWeeklyViews = Math.max(...analyticsData.weeklyStats.map((d: any) => d.views), 1)
  const maxChatFrequency = Math.max(...analyticsData.chatInsights.map((d: any) => d.frequency), 1)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance across all your restaurants</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total menu views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total QR code scans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalChats.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total chat interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.avgSessionTime}</div>
              <p className="text-xs text-muted-foreground">Average time on menu</p>
            </CardContent>
          </Card>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Restaurants */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Menus</CardTitle>
              <CardDescription>Based on views, scans, and customer engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.topRestaurants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data available yet</div>
              ) : (
                analyticsData.topRestaurants.map((restaurant: any, index: number) => (
                  <div key={restaurant.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{restaurant.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{restaurant.views} views</span>
                          <span>{restaurant.scans} scans</span>
                          <span>{restaurant.chats} chats</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{restaurant.rating || "-"}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Views, scans, and chats over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.weeklyStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No data available yet</div>
                ) : (
                  analyticsData.weeklyStats.map((day: any) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{day.day}</span>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{day.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{day.scans}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>{day.chats}</span>
                          </div>
                        </div>
                        <Progress value={(day.views / maxWeeklyViews) * 100} className="h-2 mt-1" />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Views</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Scans</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Chats</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Common Customer Questions</CardTitle>
              <CardDescription>Most frequently asked questions in chat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.chatInsights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No questions asked yet</div>
              ) : (
                analyticsData.chatInsights.map((insight: any, index: number) => (
                  <div key={insight.question} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate max-w-[300px]" title={insight.question}>{insight.question}</p>
                      <Badge variant="secondary">{insight.frequency}</Badge>
                    </div>
                    <Progress value={(insight.frequency / maxChatFrequency) * 100} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Peak Hours</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    {analyticsData.peakHours === "No data available" 
                      ? "Not enough data to determine peak hours" 
                      : `Most activity between ${analyticsData.peakHours}`}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">Chat Engagement</h4>
                  </div>
                  <p className="text-sm text-purple-800">
                    Average {analyticsData.overview.avgMessagesPerSession} questions per chat session
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
