"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
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
  MessagesSquare,
  Users,
  BarChart3,
  CheckCircle,
  Trash2,
  BookOpen,
  Plus,
  Link2,
  FileText,
  Loader2,
  XCircle,
  Info,
  Settings,
  Palette,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { StatCard } from "@/components/dashboard/stat-card"
import { PhonePreview } from "@/components/dashboard/phone-preview"
import { apiClient, type Restaurant, type RestaurantSource } from "@/lib/api"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Progress } from "@/components/ui/progress"

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

interface ChatAnalyticsData {
  total_conversations: number
  total_messages: number
  avg_messages_per_conversation: number
  unique_visitors: number
  conversations_over_time: Array<{ date: string; count: number }>
  peak_chat_hours: Array<{ hour: number; count: number }>
  popular_questions: Array<{ question: string; count: number }>
}

const formatChartDate = (dateStr: string) => {
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

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewlyCreated = searchParams.get("created") === "true"
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menus, setMenus] = useState<MenuWithDetails[]>([])
  const [analytics, setAnalytics] = useState({ qrScans: 0, totalViews: 0, chatSessions: 0 })
  const [chatAnalytics, setChatAnalytics] = useState<ChatAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(isNewlyCreated)
  const [menusLoaded, setMenusLoaded] = useState(false)
  const [loadAttempts, setLoadAttempts] = useState(0)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview")

  // Context sources state
  const [contextSources, setContextSources] = useState<RestaurantSource[]>([])
  const [isLoadingContextSources, setIsLoadingContextSources] = useState(false)
  const [contextSourcesLoaded, setContextSourcesLoaded] = useState(false)
  const [addUrlDialogOpen, setAddUrlDialogOpen] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [isAddingUrl, setIsAddingUrl] = useState(false)
  const [addUrlError, setAddUrlError] = useState("")
  const [isUploadingContext, setIsUploadingContext] = useState(false)
  const [deletingContextSourceId, setDeletingContextSourceId] = useState<string | null>(null)
  const contextFileInputRef = useRef<HTMLInputElement>(null)

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
          const [analyticsResponse, chatAnalyticsResponse] = await Promise.all([
            apiClient.getAnalyticsOverview(restaurantId),
            apiClient.getRestaurantChatAnalytics(restaurantId)
          ])

          const chatData = chatAnalyticsResponse.data?.data || null
          setChatAnalytics(chatData)

          if (analyticsResponse.data?.data) {
            setAnalytics({
              qrScans: analyticsResponse.data.data.total_qr_scans,
              totalViews: analyticsResponse.data.data.total_views,
              chatSessions: chatData?.total_conversations || 0
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

  // Context sources handlers
  const loadContextSources = useCallback(async (restaurantId: string) => {
    setIsLoadingContextSources(true)
    try {
      const response = await apiClient.getRestaurantSources(restaurantId, "context")
      if (response.data) {
        setContextSources(response.data)
      }
    } catch (err) {
      console.error("Error loading context sources:", err)
    } finally {
      setIsLoadingContextSources(false)
    }
  }, [])

  const handleAddContextUrl = useCallback(async () => {
    if (!resolvedParams?.id || !newUrl.trim()) return

    setIsAddingUrl(true)
    setAddUrlError("")

    try {
      let validatedUrl = newUrl.trim()
      if (!validatedUrl.startsWith("http://") && !validatedUrl.startsWith("https://")) {
        validatedUrl = "https://" + validatedUrl
      }

      try {
        new URL(validatedUrl)
      } catch {
        setAddUrlError("Please enter a valid URL")
        setIsAddingUrl(false)
        return
      }

      const response = await apiClient.createSource(resolvedParams.id, {
        url: validatedUrl,
        source_category: "context",
        label: newLabel.trim() || undefined,
      })

      if (response.error) {
        setAddUrlError(response.error)
      } else if (response.data) {
        await apiClient.processSource(response.data.id)
        await loadContextSources(resolvedParams.id)
        setNewUrl("")
        setNewLabel("")
        setAddUrlDialogOpen(false)
      }
    } catch (err) {
      setAddUrlError("Failed to add URL. Please try again.")
      console.error("Error adding URL:", err)
    } finally {
      setIsAddingUrl(false)
    }
  }, [resolvedParams?.id, newUrl, newLabel, loadContextSources])

  const handleContextFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !resolvedParams?.id) return

    setIsUploadingContext(true)

    try {
      const response = await apiClient.uploadSourceDocument(
        resolvedParams.id,
        file,
        { source_category: "context" }
      )

      if (response.data) {
        await apiClient.processSource(response.data.id)
        await loadContextSources(resolvedParams.id)
      }
    } catch (err) {
      console.error("Error uploading document:", err)
    } finally {
      setIsUploadingContext(false)
      if (contextFileInputRef.current) {
        contextFileInputRef.current.value = ""
      }
    }
  }, [resolvedParams?.id, loadContextSources])

  const handleDeleteContextSource = useCallback(async (sourceId: string) => {
    if (!resolvedParams?.id) return

    setDeletingContextSourceId(sourceId)

    try {
      await apiClient.deleteSource(sourceId)
      await loadContextSources(resolvedParams.id)
    } catch (err) {
      console.error("Error deleting source:", err)
    } finally {
      setDeletingContextSourceId(null)
    }
  }, [resolvedParams?.id, loadContextSources])

  // Lazy-load context sources when the tab is first activated
  useEffect(() => {
    if (activeTab === "context" && !contextSourcesLoaded && resolvedParams?.id) {
      loadContextSources(resolvedParams.id)
      setContextSourcesLoaded(true)
    }
  }, [activeTab, contextSourcesLoaded, resolvedParams?.id, loadContextSources])

  // Poll for context source status updates while any source is processing
  const hasProcessingSources = contextSources.some(
    (s) => s.status === "processing" || s.status === "pending"
  )
  const pollRestaurantIdRef = useRef(resolvedParams?.id)
  pollRestaurantIdRef.current = resolvedParams?.id

  useEffect(() => {
    if (!hasProcessingSources || activeTab !== "context") return

    const interval = setInterval(() => {
      if (pollRestaurantIdRef.current) {
        loadContextSources(pollRestaurantIdRef.current)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [hasProcessingSources, activeTab, loadContextSources])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
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

        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/restaurants">All Restaurants</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{restaurant.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{restaurant.name}</h1>
              <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                {restaurant.is_active ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{restaurant.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/restaurants/${restaurant.id}/edit`}>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              + New Live Chat
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Menus"
                value={menus.filter(m => m.is_active).length}
                icon={MenuIcon}
                trend={{ value: "Active", positive: true }}
              />
              <StatCard
                title="QR Scans"
                value={analytics.qrScans.toLocaleString()}
                icon={QrCode}
                sparklineData={[5, 8, 12, 10, 15, 18, 22]}
              />
              <StatCard
                title="Chat Sessions"
                value={analytics.chatSessions.toLocaleString()}
                icon={MessageCircle}
                sparklineData={[2, 4, 3, 6, 5, 8, 7]}
              />
              <StatCard
                title="Total Views"
                value={analytics.totalViews.toLocaleString()}
                icon={Eye}
                sparklineData={[10, 15, 12, 20, 18, 25, 30]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Management Cards */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href={menus.length > 0 ? `/dashboard/menus/${menus[0].id}/edit` : `/dashboard/menus/upload?restaurant=${restaurant.id}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-semibold">Edit Menu</p>
                        <p className="text-sm text-muted-foreground">Upload menus, update photos, and organize categories.</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href={`/dashboard/restaurants/${restaurant.id}?tab=context`} onClick={() => setActiveTab("context")}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-semibold">Chatbot Training</p>
                        <p className="text-sm text-muted-foreground">Feed your chatbot background information for your guests.</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href={menus.length > 0 ? `/dashboard/menus/${menus[0].id}/qr` : "#"}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-semibold">QR Settings</p>
                        <p className="text-sm text-muted-foreground">Customize QR codes, table tent designs, and sticker templates.</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href={menus.length > 0 ? `/dashboard/menus/${menus[0].id}/edit?tab=design` : "#"}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-3">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-semibold">Appearance</p>
                        <p className="text-sm text-muted-foreground">Customize your menu&apos;s visual colors, fonts, and formatting.</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Coming Soon Card */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Marketing Insights</p>
                        <Badge variant="secondary" className="text-xs">NEW</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Get AI-powered insights on customer preferences, peak hours, and popular menu items.</p>
                      <Button variant="outline" size="sm">Notify Me</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Link & QR buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => {
                    const activeMenu = menus.find(m => m.qr_code_data)
                    if (activeMenu) {
                      navigator.clipboard.writeText(`${window.location.origin}/menu/${restaurant.id}?token=${activeMenu.qr_code_data}`)
                    }
                  }}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR
                  </Button>
                </div>
              </div>

              {/* Phone Preview */}
              <div className="hidden lg:flex justify-center">
                <PhonePreview
                  previewUrl={
                    menus.find(m => m.qr_code_data)
                      ? `/menu/${restaurant.id}?token=${menus.find(m => m.qr_code_data)?.qr_code_data}`
                      : undefined
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menus" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Menus</h3>
                <p className="text-muted-foreground">Manage your restaurant's menus</p>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading menus...</p>
                </div>
              ) : menus.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <MenuIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No menus found</h3>
                  <p className="text-muted-foreground mb-4">This restaurant doesn't have any menus yet.</p>
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
                                        {menu.image ? (
                      <img 
                        src={menu.image} 
                        alt={menu.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <MenuIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={menu.is_active ? "default" : "secondary"}>
                        {menu.is_active ? "active" : "inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <Link href={`/dashboard/menus/${menu.id}/edit`}>
                      <CardTitle className="text-lg hover:underline cursor-pointer">{menu.name}</CardTitle>
                    </Link>
                    <CardDescription>
                      {restaurant?.description || "Restaurant menu"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{menu.stats?.total_items || 0} items</span>
                      <span>Updated {new Date(menu.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={menu.qr_code_data ? `/menu/${restaurant.id}?token=${menu.qr_code_data}` : `/dashboard/menus/${menu.id}/qr`} className="flex-1" target={menu.qr_code_data ? "_blank" : "_self"}>
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

          <TabsContent value="context" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Restaurant Context</h3>
                <p className="text-muted-foreground">
                  These sources help your chatbot answer general questions about your restaurant (hours, location, policies, etc.)
                </p>
              </div>
              <div className="flex gap-3">
                <Dialog open={addUrlDialogOpen} onOpenChange={setAddUrlDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add URL
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add URL Source</DialogTitle>
                      <DialogDescription>
                        Add a website URL to extract context information from.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="context-url">URL</Label>
                        <Input
                          id="context-url"
                          placeholder="https://example.com/about"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="context-label">Label (optional)</Label>
                        <Input
                          id="context-label"
                          placeholder="e.g., About Us page"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                        />
                      </div>
                      {addUrlError && (
                        <p className="text-sm text-red-500">{addUrlError}</p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddUrlDialogOpen(false)
                          setNewUrl("")
                          setNewLabel("")
                          setAddUrlError("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddContextUrl}
                        disabled={!newUrl.trim() || isAddingUrl}
                      >
                        {isAddingUrl ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add URL"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => contextFileInputRef.current?.click()}
                  disabled={isUploadingContext}
                >
                  {isUploadingContext ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
                <input
                  ref={contextFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleContextFileUpload}
                />
              </div>
            </div>

            {isLoadingContextSources ? (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ) : contextSources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No context sources yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add URLs or upload documents to help your chatbot answer questions about your restaurant.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {contextSources.map((source) => (
                  <Card key={source.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {source.source_type === "url" ? (
                              <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {source.label || source.url || source.file_name || "Unknown source"}
                            </span>
                            {getStatusBadge(source.status)}
                          </div>

                          {source.url && (
                            <p className="text-sm text-muted-foreground truncate mb-2">{source.url}</p>
                          )}

                          {source.raw_content && (
                            <div className="bg-gray-50 rounded p-3 mt-2">
                              <p className="text-sm text-muted-foreground">
                                {source.raw_content.length > 200
                                  ? source.raw_content.substring(0, 200) + "..."
                                  : source.raw_content}
                              </p>
                            </div>
                          )}

                          {source.error_message && (
                            <p className="text-sm text-red-500 mt-2">{source.error_message}</p>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {source.last_processed_at && (
                              <span>
                                Last processed: {new Date(source.last_processed_at).toLocaleString()}
                              </span>
                            )}
                            <span>
                              Added: {new Date(source.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletingContextSourceId === source.id}
                              >
                                {deletingContextSourceId === source.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Context Source</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this source? This will also delete any context embeddings associated with it. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteContextSource(source.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Menu views</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.qrScans.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total QR code scans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(chatAnalytics?.total_conversations || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Chat interactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(chatAnalytics?.unique_visitors || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Distinct chatbot users</p>
                </CardContent>
              </Card>
            </div>

            {/* Conversations Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Conversations Over Time</CardTitle>
                <CardDescription>Daily conversation counts</CardDescription>
              </CardHeader>
              <CardContent>
                {!chatAnalytics?.conversations_over_time?.some(d => d.count > 0) ? (
                  <div className="text-center py-12 text-muted-foreground">No conversation data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chatAnalytics?.conversations_over_time}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatChartDate} />
                      <YAxis />
                      <Tooltip labelFormatter={formatChartDate} />
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
                  <CardDescription>Most frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!chatAnalytics?.popular_questions?.length ? (
                    <div className="text-center py-8 text-muted-foreground">No questions asked yet</div>
                  ) : (
                    chatAnalytics.popular_questions.map((q, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                            <p className="text-sm font-medium truncate max-w-[300px]" title={q.question}>{q.question}</p>
                          </div>
                          <Badge variant="secondary">{q.count}</Badge>
                        </div>
                        <Progress value={(q.count / Math.max(...(chatAnalytics?.popular_questions?.map(pq => pq.count) || []), 1)) * 100} className="h-2" />
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
                  {!chatAnalytics?.peak_chat_hours?.some(h => h.count > 0) ? (
                    <div className="text-center py-8 text-muted-foreground">No chat hour data yet</div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {chatAnalytics.peak_chat_hours.map((h) => (
                        <div
                          key={h.hour}
                          className={`p-2 rounded text-center ${getHourIntensityClass(h.count, Math.max(...(chatAnalytics?.peak_chat_hours?.map(ph => ph.count) || []), 1))}`}
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

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Summary for {restaurant.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Menus</span>
                    <span className="text-sm text-muted-foreground">{menus.filter(m => m.is_active).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Menus</span>
                    <span className="text-sm text-muted-foreground">{menus.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Views per Menu</span>
                    <span className="text-sm text-muted-foreground">
                      {menus.length > 0 ? Math.round(analytics.totalViews / menus.length).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Messages / Conversation</span>
                    <span className="text-sm text-muted-foreground">
                      {chatAnalytics?.avg_messages_per_conversation?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Messages</span>
                    <span className="text-sm text-muted-foreground">
                      {(chatAnalytics?.total_messages || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
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
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
