"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  ArrowLeft,
  Plus,
  Upload,
  Link2,
  FileText,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Info,
} from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { apiClient, type Restaurant } from "@/lib/api"

interface RestaurantSource {
  id: string
  restaurant_id: string
  source_category: string
  source_type: string
  url?: string
  file_url?: string
  file_name?: string
  file_type?: string
  menu_id?: string
  status: string
  label?: string
  is_active: boolean
  raw_content?: string
  structured_data?: { [key: string]: any }
  items_extracted?: number
  error_message?: string
  last_processed_at?: string
  created_at: string
  updated_at: string
}

export default function RestaurantContextPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [sources, setSources] = useState<RestaurantSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSources, setIsLoadingSources] = useState(false)
  const [error, setError] = useState("")

  // Add URL dialog state
  const [addUrlDialogOpen, setAddUrlDialogOpen] = useState(false)
  const [newUrl, setNewUrl] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [isAddingUrl, setIsAddingUrl] = useState(false)
  const [addUrlError, setAddUrlError] = useState("")

  // Upload state
  const [isUploading, setIsUploading] = useState(false)

  // Delete state
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null)

  // Resolve params promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  // Load restaurant data
  useEffect(() => {
    if (!resolvedParams?.id) return

    const fetchRestaurant = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await apiClient.getRestaurant(resolvedParams.id)

        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setRestaurant(response.data)
          await loadSources(resolvedParams.id)
        }
      } catch (err) {
        setError("Failed to load restaurant. Please try again.")
        console.error("Error fetching restaurant:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, [resolvedParams?.id])

  const loadSources = async (restaurantId: string) => {
    setIsLoadingSources(true)
    try {
      const response = await apiClient.getRestaurantSources(restaurantId, "context")
      if (response.data) {
        setSources(response.data)
      }
    } catch (err) {
      console.error("Error loading sources:", err)
    } finally {
      setIsLoadingSources(false)
    }
  }

  const handleAddUrl = async () => {
    if (!resolvedParams?.id || !newUrl.trim()) return

    setIsAddingUrl(true)
    setAddUrlError("")

    try {
      // Validate URL format
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
        // Dispatch processing
        await apiClient.processSource(response.data.id)
        // Refresh sources
        await loadSources(resolvedParams.id)
        // Reset form and close dialog
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
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !resolvedParams?.id) return

    setIsUploading(true)

    try {
      const response = await apiClient.uploadSourceDocument(
        resolvedParams.id,
        file,
        { source_category: "context" }
      )

      if (response.data) {
        // Dispatch processing
        await apiClient.processSource(response.data.id)
        // Refresh sources
        await loadSources(resolvedParams.id)
      }
    } catch (err) {
      console.error("Error uploading document:", err)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (!resolvedParams?.id) return

    setDeletingSourceId(sourceId)

    try {
      await apiClient.deleteSource(sourceId)
      await loadSources(resolvedParams.id)
    } catch (err) {
      console.error("Error deleting source:", err)
    } finally {
      setDeletingSourceId(null)
    }
  }

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

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-4">
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
        <div className="p-6 max-w-4xl mx-auto">
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
        <div className="p-6 max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Restaurant not found.</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/restaurants/${resolvedParams?.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Restaurant
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Context</h1>
          <p className="text-gray-600">
            These sources help your chatbot answer general questions about your restaurant (hours, location, policies, etc.)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
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
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/about"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label (optional)</Label>
                  <Input
                    id="label"
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
                  onClick={handleAddUrl}
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
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
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
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
          />
        </div>

        {/* Sources List */}
        {isLoadingSources ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : sources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No context sources yet</h3>
              <p className="text-gray-600 mb-4">
                Add URLs or upload documents to help your chatbot answer questions about your restaurant.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {source.source_type === "url" ? (
                          <Link2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">
                          {source.label || source.url || source.file_name || "Unknown source"}
                        </span>
                        {getStatusBadge(source.status)}
                      </div>

                      {source.url && !source.label && (
                        <p className="text-sm text-gray-500 truncate mb-2">{source.url}</p>
                      )}
                      {source.url && source.label && (
                        <p className="text-sm text-gray-500 truncate mb-2">{source.url}</p>
                      )}

                      {source.raw_content && (
                        <div className="bg-gray-50 rounded p-3 mt-2">
                          <p className="text-sm text-gray-600">
                            {truncateContent(source.raw_content)}
                          </p>
                        </div>
                      )}

                      {source.error_message && (
                        <p className="text-sm text-red-500 mt-2">{source.error_message}</p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
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
                            disabled={deletingSourceId === source.id}
                          >
                            {deletingSourceId === source.id ? (
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
                              onClick={() => handleDeleteSource(source.id)}
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
      </div>
    </DashboardLayout>
  )
}
