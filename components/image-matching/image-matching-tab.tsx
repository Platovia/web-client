"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Images,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Link2,
  Unlink,
  Loader2,
  ImageIcon,
  Zap,
  Trash2,
  Wand2,
  Search,
  Upload,
  Info
} from "lucide-react"
import {
  apiClient,
  type ExtractedMenuImage,
  type ExtractedImagesResponse,
  type AutoMatchImagesResponse,
  type MenuItem
} from "@/lib/api"
import ImageAssignmentModal from "./image-assignment-modal"
import { resolveImageUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface ImageMatchingTabContentProps {
  menuId: string
  versionId?: string | null
  readOnly?: boolean
}

export default function ImageMatchingTabContent({ menuId, versionId, readOnly }: ImageMatchingTabContentProps) {
  const [extractedImages, setExtractedImages] = useState<ExtractedMenuImage[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAutoMatching, setIsAutoMatching] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [stats, setStats] = useState({ total: 0, assigned: 0, unassigned: 0 })

  // New state for image generation and deletion
  const [isGeneratingImage, setIsGeneratingImage] = useState<Record<string, boolean>>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<string | null>(null)
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [warningAction, setWarningAction] = useState<(() => void) | null>(null)
  const [itemSearch, setItemSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const isReadOnly = Boolean(readOnly)

  useEffect(() => {
    if (menuId) {
      loadData()
    }
  }, [menuId, versionId])

  const loadData = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Load extracted images
      const imagesResponse = await apiClient.getExtractedImages(menuId)
      if (imagesResponse.error) {
        setError(imagesResponse.error)
      } else if (imagesResponse.data) {
        setExtractedImages(imagesResponse.data.extracted_images)
        setStats({
          total: imagesResponse.data.total_count,
          assigned: imagesResponse.data.assigned_count,
          unassigned: imagesResponse.data.unassigned_count
        })
      }

      // Load menu items
      const itemsResponse = await apiClient.getMenuItems(menuId, versionId || undefined)
      if (itemsResponse.error) {
        setError(itemsResponse.error)
      } else if (itemsResponse.data) {
        setMenuItems(itemsResponse.data.items)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load image matching data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTriggerExtraction = async () => {
    setIsExtracting(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiClient.triggerImageExtraction(menuId, versionId || undefined)
      if (response.error) {
        setError(response.error)
        setIsExtracting(false)
        return
      }

      if (response.data) {
        setSuccess(response.data.message)

        // Poll for results — check every 3s, stop after 60s or when new images appear
        const initialCount = stats.total
        const maxAttempts = 20 // 20 * 3s = 60s
        let attempts = 0

        const poll = setInterval(async () => {
          attempts++
          try {
            const imagesResponse = await apiClient.getExtractedImages(menuId)
            if (imagesResponse.data) {
              const newTotal = imagesResponse.data.total_count
              if (newTotal > initialCount || attempts >= maxAttempts) {
                clearInterval(poll)
                setExtractedImages(imagesResponse.data.extracted_images)
                setStats({
                  total: imagesResponse.data.total_count,
                  assigned: imagesResponse.data.assigned_count,
                  unassigned: imagesResponse.data.unassigned_count,
                })
                if (newTotal > initialCount) {
                  setSuccess(`${newTotal - initialCount} new images extracted!`)
                } else {
                  setSuccess("Extraction finished. No new images found.")
                }
                setIsExtracting(false)
              }
            }
          } catch {
            // keep polling on transient errors
          }
          if (attempts >= maxAttempts) {
            clearInterval(poll)
            setIsExtracting(false)
          }
        }, 3000)
      }
    } catch (err) {
      console.error("Error triggering extraction:", err)
      setError("Failed to extract images")
      setIsExtracting(false)
    }
  }

  const handleAutoMatch = async () => {
    setIsAutoMatching(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiClient.autoMatchImages(menuId, versionId || undefined)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setSuccess(response.data.message)
        await loadData()
      }
    } catch (err) {
      console.error("Error auto-matching:", err)
      setError("Failed to auto-match images")
    } finally {
      setIsAutoMatching(false)
    }
  }

  const handleAssignImage = (itemId: string) => {
    setSelectedItemId(itemId)
    setAssignModalOpen(true)
  }

  const handleRemoveImage = async (itemId: string) => {
    setError("")
    setSuccess("")

    try {
      const response = await apiClient.removeImageFromItem(menuId, itemId)
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Image removed successfully!")
        await loadData()
      }
    } catch (err) {
      console.error("Error removing image:", err)
      setError("Failed to remove image")
    }
  }

  const handleAssignmentComplete = async () => {
    setAssignModalOpen(false)
    setSelectedItemId(null)
    setSuccess("Image assigned successfully!")
    await loadData()
  }

  const handleUnassignImage = async (imageId: string) => {
    setError("")
    setSuccess("")

    try {
      const image = extractedImages.find(img => img.id === imageId)
      if (!image || !image.assigned_to_item_id) {
        setError("Image is not assigned to any item")
        return
      }

      const response = await apiClient.removeImageFromItem(menuId, image.assigned_to_item_id)
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Image unassigned successfully!")
        await loadData()
      }
    } catch (err) {
      console.error("Error unassigning image:", err)
      setError("Failed to unassign image")
    }
  }

  const getAssignedMenuItem = (imageId: string) => {
    const image = extractedImages.find(img => img.id === imageId)
    if (!image || !image.assigned_to_item_id) return null
    return menuItems.find(item => item.id === image.assigned_to_item_id)
  }

  const handleGenerateImage = async (itemId: string) => {
    setError("")
    setSuccess("")

    setIsGeneratingImage(prev => ({ ...prev, [itemId]: true }))

    try {
      const response = await apiClient.generateImageForItem(menuId, itemId)

      if (response.error) {
        if (response.error.includes("already has an image assigned")) {
          setWarningMessage(response.error)
          setWarningAction(() => () => handleRegenerateImage(itemId))
          setWarningModalOpen(true)
        } else {
          setError(response.error)
        }
      } else {
        setSuccess("Image generated and assigned successfully!")
        await loadData()
      }
    } catch (err) {
      console.error("Error generating image:", err)
      setError("Failed to generate image")
    } finally {
      setIsGeneratingImage(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleRegenerateImage = async (itemId: string) => {
    setError("")
    setSuccess("")
    setWarningModalOpen(false)
    setWarningAction(null)

    setIsGeneratingImage(prev => ({ ...prev, [itemId]: true }))

    try {
      const response = await apiClient.regenerateImageForItem(menuId, itemId)

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Image regenerated and assigned successfully!")
        await loadData()
      }
    } catch (err) {
      console.error("Error regenerating image:", err)
      setError("Failed to regenerate image")
    } finally {
      setIsGeneratingImage(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setError("")
    setSuccess("")
    setDeleteConfirmOpen(false)
    setImageToDelete(null)

    try {
      const response = await apiClient.deleteExtractedImage(menuId, imageId)

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Image deleted successfully!")
        await loadData()
      }
    } catch (err) {
      console.error("Error deleting image:", err)
      setError("Failed to delete image")
    }
  }

  const openDeleteConfirm = (imageId: string) => {
    setImageToDelete(imageId)
    setDeleteConfirmOpen(true)
  }

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null

    if (confidence >= 0.8) {
      return <Badge variant="default" className="bg-green-600">🟢 {Math.round(confidence * 100)}%</Badge>
    } else if (confidence >= 0.6) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">🟡 {Math.round(confidence * 100)}%</Badge>
    } else {
      return <Badge variant="outline" className="text-red-600 border-red-600">🔴 {Math.round(confidence * 100)}%</Badge>
    }
  }

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category || "Other").filter(Boolean))
  )

  const sanitize = (text?: string | null) =>
    (text || "")
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()

  const buildGoogleImageSearchUrl = (item: MenuItem) => {
    const parts = [
      sanitize(item.name),
      sanitize(item.category),
      "restaurant dish photo",
    ].filter(Boolean)
    const query = parts.join(" ")
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(itemSearch.toLowerCase())
    const matchesCategory =
      categoryFilter === "All" || (item.category || "Other") === categoryFilter
    return matchesSearch && matchesCategory
  })

  const focusedItem = focusedItemId ? menuItems.find(i => i.id === focusedItemId) : null

  // Get images relevant to the focused item
  const getImagesForItem = (itemId: string) => {
    return extractedImages.filter(img => img.assigned_to_item_id === itemId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading image matching data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Image Matching</h3>
          <p className="text-sm text-muted-foreground">Extract and assign individual food images to menu items</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTriggerExtraction}
            disabled={isReadOnly || isExtracting}
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Images className="h-4 w-4 mr-2" />
            )}
            Extract Images
          </Button>
          <Button
            onClick={handleAutoMatch}
            disabled={isReadOnly || isAutoMatching || extractedImages.length === 0}
          >
            {isAutoMatching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Auto-Match
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {isReadOnly && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This version is archived and read-only. Image matching actions are disabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Images</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold">{stats.assigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Unlink className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold">{stats.unassigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex gap-6 h-[600px]">
        {/* Left Panel — Menu Items List */}
        <div className="w-[350px] flex-shrink-0 flex flex-col border rounded-lg bg-card">
          <div className="p-4 border-b space-y-3">
            <h3 className="font-semibold text-foreground">Extracted Items</h3>
            <Input
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="h-9"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredMenuItems.length === 0 && (
              <div className="text-sm text-muted-foreground p-4 text-center">
                No items match your search/filter.
              </div>
            )}
            {filteredMenuItems.map((item) => {
              const isMatched = Boolean(item.image_url)
              const isFocused = focusedItemId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFocusedItemId(isFocused ? null : item.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors",
                    isFocused
                      ? "bg-primary/10 border-l-2 border-l-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                      )}
                      {item.price != null && (
                        <p className="text-sm font-medium text-green-600 mt-0.5">
                          ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={isMatched ? "default" : "secondary"}
                      className={cn(
                        "flex-shrink-0 text-xs",
                        isMatched ? "bg-green-600 hover:bg-green-600" : ""
                      )}
                    >
                      {isMatched ? "Matched" : "Unmatched"}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Panel — Image Gallery */}
        <div className="flex-1 flex flex-col border rounded-lg bg-card">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Image Gallery</h3>
              <span className="text-sm text-muted-foreground">({extractedImages.length})</span>
            </div>
            <div className="flex gap-2">
              {focusedItem && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignImage(focusedItem.id)}
                    disabled={isReadOnly}
                  >
                    <Link2 className="h-4 w-4 mr-1" />
                    Assign / Upload
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateImage(focusedItem.id)}
                    disabled={isReadOnly || isGeneratingImage[focusedItem.id]}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingImage[focusedItem.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-1" />
                        {focusedItem.image_url ? "Regenerate" : "Generate"}
                      </>
                    )}
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={buildGoogleImageSearchUrl(focusedItem)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Search Google Images for ${focusedItem.name}`}
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </a>
                  </Button>
                </>
              )}
              {!focusedItem && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (filteredMenuItems.length > 0) {
                      setFocusedItemId(filteredMenuItems[0].id)
                      setSelectedItemId(filteredMenuItems[0].id)
                      setAssignModalOpen(true)
                    }
                  }}
                  disabled={isReadOnly || filteredMenuItems.length === 0}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Show context for focused item */}
            {focusedItem && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium text-foreground">
                    AI Suggestions for &ldquo;{focusedItem.name}&rdquo;
                  </h4>
                </div>
                {focusedItem.image_url && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                      <img
                        src={resolveImageUrl(focusedItem.image_url) || "/placeholder.jpg"}
                        alt={focusedItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Current image assigned</p>
                      <p className="text-xs text-muted-foreground truncate">{focusedItem.name}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(focusedItem.id)}
                      disabled={isReadOnly}
                      className="text-xs"
                    >
                      <Unlink className="h-3 w-3 mr-1" />
                      Unassign
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Image Grid */}
            {extractedImages.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">No images extracted yet</h4>
                <p className="text-muted-foreground mb-4">Click &ldquo;Extract Images&rdquo; to identify food items in your menu photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {extractedImages.map((image) => {
                  const assignedItem = getAssignedMenuItem(image.id)
                  const isAssignedToFocused = focusedItem && image.assigned_to_item_id === focusedItem.id
                  return (
                    <div
                      key={image.id}
                      className={cn(
                        "border rounded-lg overflow-hidden group transition-all",
                        isAssignedToFocused && "ring-2 ring-primary border-primary"
                      )}
                    >
                      <div className="aspect-square relative bg-muted">
                        <img
                          src={resolveImageUrl(image.image_url) || "/placeholder.jpg"}
                          alt={image.ai_description || "Food item"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 right-1.5">
                          {image.is_assigned ? (
                            <Badge variant="default" className="bg-green-600 text-xs">
                              <Link2 className="h-3 w-3 mr-1" />
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Available
                            </Badge>
                          )}
                        </div>
                        {image.extraction_confidence && image.extraction_confidence >= 0.8 && (
                          <div className="absolute top-1.5 left-1.5">
                            <Badge className="bg-purple-600 text-xs">
                              <Sparkles className="h-3 w-3 mr-0.5" />
                              AI
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{image.ai_description}</p>
                        {getConfidenceBadge(image.extraction_confidence)}
                        {assignedItem && (
                          <p className="text-xs font-medium text-foreground mt-1 truncate">
                            → {assignedItem.name}
                          </p>
                        )}
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.is_assigned ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={() => handleUnassignImage(image.id)}
                              disabled={isReadOnly}
                            >
                              <Unlink className="h-3 w-3 mr-1" />
                              Unassign
                            </Button>
                          ) : (
                            <>
                              {focusedItem && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs flex-1"
                                  onClick={() => handleAssignImage(focusedItem.id)}
                                  disabled={isReadOnly}
                                >
                                  <Link2 className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-red-600 hover:text-red-700"
                                onClick={() => openDeleteConfirm(image.id)}
                                disabled={isReadOnly}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Assignment Modal */}
      {assignModalOpen && selectedItemId && (
        <ImageAssignmentModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          menuId={menuId}
          itemId={selectedItemId}
          menuItems={menuItems}
          extractedImages={extractedImages.filter(img => !img.is_assigned)}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => imageToDelete && handleDeleteImage(imageToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Modal for Image Assignment Conflicts */}
      <Dialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Image</DialogTitle>
            <DialogDescription>
              {warningMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => warningAction && warningAction()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Unassign & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
