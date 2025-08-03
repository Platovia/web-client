"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Images, 
  RefreshCw, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  Link2,
  Unlink,
  Loader2,
  ImageIcon,
  Zap,
  Trash2,
  Wand2
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

interface ImageMatchingTabContentProps {
  menuId: string
}

export default function ImageMatchingTabContent({ menuId }: ImageMatchingTabContentProps) {
  const [extractedImages, setExtractedImages] = useState<ExtractedMenuImage[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAutoMatching, setIsAutoMatching] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
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

  useEffect(() => {
    if (menuId) {
      loadData()
    }
  }, [menuId])

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
      const itemsResponse = await apiClient.getMenuItems(menuId)
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
      const response = await apiClient.triggerImageExtraction(menuId)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setSuccess(`${response.data.extracted_count} images extracted successfully!`)
        // Reload data to show new images
        await loadData()
      }
    } catch (err) {
      console.error("Error triggering extraction:", err)
      setError("Failed to extract images")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleAutoMatch = async () => {
    setIsAutoMatching(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiClient.autoMatchImages(menuId)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setSuccess(response.data.message)
        // Reload data to show updated assignments
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
      // Find the assigned item for this image
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

  // New handler functions for AI image generation and deletion
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
          <p className="text-sm text-gray-600">Extract and assign individual food images to menu items</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleTriggerExtraction}
            disabled={isExtracting}
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
            disabled={isAutoMatching || extractedImages.length === 0}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Images className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Images</p>
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
                <p className="text-sm text-gray-600">Assigned</p>
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
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold">{stats.unassigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Extracted Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" />
              Extracted Images
            </CardTitle>
            <CardDescription>
              AI-extracted food item images from your menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {extractedImages.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No images extracted yet</h4>
                <p className="text-gray-600 mb-4">Click "Extract Images" to identify food items in your menu photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {extractedImages.map((image) => (
                  <div key={image.id} className="border rounded-lg p-3">
                    <div className="aspect-square relative mb-2 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={resolveImageUrl(image.image_url) || "/placeholder.jpg"} 
                        alt={image.ai_description || "Food item"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {image.is_assigned ? (
                          <Badge variant="default" className="bg-green-600">
                            <Link2 className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{image.ai_description}</p>
                    {getConfidenceBadge(image.extraction_confidence)}
                    
                    {/* Show assigned item info */}
                    {image.is_assigned && (
                      <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-green-800">Assigned to:</p>
                            <p className="text-sm font-semibold text-green-900">
                              {getAssignedMenuItem(image.id)?.name || "Unknown Item"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignImage(image.id)}
                            className="text-xs h-7 px-2"
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Unassign
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Delete button for unassigned images */}
                    {!image.is_assigned && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirm(image.id)}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Image
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Menu Items
            </CardTitle>
            <CardDescription>
              Assign images to your menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.image_url ? (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={resolveImageUrl(item.image_url) || "/placeholder.jpg"} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveImage(item.id)}
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignImage(item.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateImage(item.id)}
                          disabled={isGeneratingImage[item.id]}
                        >
                          {isGeneratingImage[item.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignImage(item.id)}
                          disabled={stats.unassigned === 0}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Assign Image
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleGenerateImage(item.id)}
                          disabled={isGeneratingImage[item.id]}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isGeneratingImage[item.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate Image
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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