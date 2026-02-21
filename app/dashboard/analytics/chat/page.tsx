"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, MessagesSquare, BarChart3, Users } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { apiClient } from "@/lib/api"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ChatAnalyticsData {
  total_conversations: number
  total_messages: number
  avg_messages_per_conversation: number
  unique_visitors: number
  conversations_over_time: Array<{ date: string; count: number }>
  peak_chat_hours: Array<{ hour: number; count: number }>
  popular_questions: Array<{ question: string; count: number }>
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatHour = (hour: number) => {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

const getHourIntensityClass = (count: number, maxCount: number) => {
  if (maxCount === 0) return 'bg-primary/5 text-primary'
  const intensity = count / maxCount
  if (intensity === 0) return 'bg-primary/5 text-primary'
  if (intensity < 0.25) return 'bg-primary/10 text-primary'
  if (intensity < 0.5) return 'bg-primary/20 text-primary'
  if (intensity < 0.75) return 'bg-primary/60 text-primary-foreground'
  return 'bg-primary text-primary-foreground'
}

export default function ChatAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<ChatAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      setError("")

      try {
        // Get user's first company
        const companiesRes = await apiClient.getUserCompanies()
        if (companiesRes.error || !companiesRes.data?.companies?.[0]) {
          setError("No company found")
          setIsLoading(false)
          return
        }
        const companyId = companiesRes.data.companies[0].id

        // Get first restaurant for that company
        const restaurantsRes = await apiClient.getCompanyRestaurants(companyId)
        if (restaurantsRes.error || !restaurantsRes.data?.restaurants?.[0]) {
          setError("No restaurant found")
          setIsLoading(false)
          return
        }
        const restaurantId = restaurantsRes.data.restaurants[0].id

        // Get chat analytics for the restaurant
        const analyticsRes = await apiClient.getRestaurantChatAnalytics(restaurantId)
        if (analyticsRes.error) {
          setError(analyticsRes.error)
          setIsLoading(false)
          return
        }

        if (analyticsRes.data?.data) {
          setAnalyticsData(analyticsRes.data.data)
        }
      } catch (err) {
        console.error("Error loading chat analytics:", err)
        setError("Failed to load chat analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  // Check if conversations_over_time has any data
  const hasConversationData = analyticsData?.conversations_over_time?.some(d => d.count > 0)

  // Calculate max values for visualizations
  const maxQuestionCount = Math.max(...(analyticsData?.popular_questions?.map(q => q.count) || []), 1)
  const maxHourCount = Math.max(...(analyticsData?.peak_chat_hours?.map(h => h.count) || []), 1)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chat Analytics</h1>
            <p className="text-muted-foreground">Insights into your chatbot conversations</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chat Analytics</h1>
            <p className="text-muted-foreground">Insights into your chatbot conversations</p>
          </div>
          <div className="text-center py-12 text-red-600">{error}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat Analytics</h1>
          <p className="text-muted-foreground">Insights into your chatbot conversations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.total_conversations?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessagesSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.total_messages?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Messages / Conversation</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.avg_messages_per_conversation?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.unique_visitors?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations Over Time</CardTitle>
            <CardDescription>Daily conversation counts over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasConversationData ? (
              <div className="text-center py-12 text-muted-foreground">No conversation data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.conversations_over_time}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip labelFormatter={formatDate} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Questions</CardTitle>
              <CardDescription>Most frequently asked questions by customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analyticsData?.popular_questions?.length ? (
                <div className="text-center py-8 text-muted-foreground">No questions asked yet</div>
              ) : (
                analyticsData.popular_questions.map((q, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <p className="text-sm font-medium truncate max-w-[300px]" title={q.question}>{q.question}</p>
                      </div>
                      <Badge variant="secondary">{q.count}</Badge>
                    </div>
                    <Progress value={(q.count / maxQuestionCount) * 100} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Peak Chat Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Chat Hours</CardTitle>
              <CardDescription>When customers chat the most</CardDescription>
            </CardHeader>
            <CardContent>
              {!analyticsData?.peak_chat_hours?.some(h => h.count > 0) ? (
                <div className="text-center py-8 text-muted-foreground">No chat hour data yet</div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {analyticsData.peak_chat_hours.map((h) => (
                    <div
                      key={h.hour}
                      className={`p-2 rounded text-center ${getHourIntensityClass(h.count, maxHourCount)}`}
                    >
                      <div className="text-xs font-medium">{formatHour(h.hour)}</div>
                      <div className="text-sm font-bold">{h.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
