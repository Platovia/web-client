"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  X, 
  Search, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Loader2
} from "lucide-react"
import { 
  apiClient, 
  type ExtractedMenuImage, 
  type MenuItem
} from "@/lib/api"
import { resolveImageUrl } from "@/lib/utils"

interface ImageAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  menuId: string
  itemId: string
  menuItems: MenuItem[]
  extractedImages: ExtractedMenuImage[]
  onAssignmentComplete: () => void
}

export default function ImageAssignmentModal({
  isOpen,
  onClose,
  menuId,
  itemId,
  menuItems,
  extractedImages,
  onAssignmentComplete
}: ImageAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState("")
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedItem = menuItems.find(item => item.id === itemId)
  if (!selectedItem) return null

  // Filter images based on search query
  const filteredImages = extractedImages.filter(image =>
    !searchQuery || 
    (image.ai_description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  // Get AI suggestions based on item name and description
  const getAISuggestions = () => {
    const itemText = `${selectedItem.name} ${selectedItem.description || ""}`.toLowerCase()
    
    return extractedImages
      .map(image => {
        const description = image.ai_description?.toLowerCase() || ""
        let score = 0
        
        // Simple keyword matching for suggestions
        const itemWords = itemText.split(/\s+/).filter(word => word.length > 2)
        const descWords = description.split(/\s+/)
        
        itemWords.forEach(itemWord => {
          if (descWords.some(descWord => descWord.includes(itemWord) || itemWord.includes(descWord))) {
            score += 1
          }
        })
        
        // Category matching
        if (selectedItem.category && description.includes(selectedItem.category.toLowerCase())) {
          score += 2
        }
        
        return { image, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2) // Top 2 suggestions
  }

  const aiSuggestions = getAISuggestions()

  const handleAssignImage = async (imageId: string) => {
    setIsAssigning(true)
    setError("")

    try {
      const response = await apiClient.assignImageToItem(menuId, itemId, imageId)
      if (response.error) {
        setError(response.error)
      } else {
        onAssignmentComplete()
      }
    } catch (err) {
      console.error("Error assigning image:", err)
      setError("Failed to assign image")
    } finally {
      setIsAssigning(false)
    }
  }

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null
    
    if (confidence >= 0.8) {
      return <Badge variant="default" className="bg-green-600 text-xs">🟢 {Math.round(confidence * 100)}%</Badge>
    } else if (confidence >= 0.6) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">🟡 {Math.round(confidence * 100)}%</Badge>
    } else {
      return <Badge variant="outline" className="text-red-600 border-red-600 text-xs">🔴 {Math.round(confidence * 100)}%</Badge>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Assign Image to "{selectedItem.name}"
              </CardTitle>
              <CardDescription>
                {selectedItem.description && (
                  <span className="block mt-1">{selectedItem.description}</span>
                )}
                {selectedItem.category && (
                  <Badge variant="outline" className="mt-2">
                    {selectedItem.category}
                  </Badge>
                )}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-medium">AI Suggestions</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {aiSuggestions.map(({ image, score }) => (
                  <div 
                    key={image.id} 
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedImageId === image.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-purple-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedImageId(image.id)}
                    onMouseEnter={() => setHoveredImageId(image.id)}
                    onMouseLeave={() => setHoveredImageId(null)}
                  >
                    <div className="aspect-square relative mb-2 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={resolveImageUrl(image.image_url) || "/placeholder.jpg"} 
                        alt={image.ai_description || "Food item"}
                        className="w-full h-full object-cover"
                      />
                      {hoveredImageId === image.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">{image.ai_description}</p>
                      <div className="flex items-center justify-between">
                        {getConfidenceBadge(image.extraction_confidence)}
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 text-xs">
                          Match Score: {score}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Images</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* All Available Images */}
          <div>
            <Label className="text-sm font-medium">All Available Images</Label>
            <p className="text-xs text-gray-600 mb-3">{filteredImages.length} images available</p>
            
            {filteredImages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No images available for assignment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {filteredImages.map((image) => (
                  <div 
                    key={image.id}
                    className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
                      selectedImageId === image.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImageId(image.id)}
                    onMouseEnter={() => setHoveredImageId(image.id)}
                    onMouseLeave={() => setHoveredImageId(null)}
                  >
                    <div className="aspect-square relative mb-2 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={resolveImageUrl(image.image_url) || "/placeholder.jpg"} 
                        alt={image.ai_description || "Food item"}
                        className="w-full h-full object-cover"
                      />
                      {hoveredImageId === image.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 line-clamp-2">{image.ai_description}</p>
                      {getConfidenceBadge(image.extraction_confidence)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isAssigning}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedImageId && handleAssignImage(selectedImageId)}
              disabled={!selectedImageId || isAssigning}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign Image
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Skip - No Image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}