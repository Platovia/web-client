"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, FileImage, Loader2, CheckCircle, X } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

// Dummy restaurants for selection
const dummyRestaurants = [
  { id: "1", name: "Bella Vista Italian" },
  { id: "2", name: "Tokyo Sushi Bar" },
  { id: "3", name: "Mountain Grill" },
  { id: "4", name: "Spice Garden" },
]

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedItems?: number
}

export default function UploadMenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedRestaurant = searchParams.get("restaurant")

  const [selectedRestaurant, setSelectedRestaurant] = useState(preselectedRestaurant || "")
  const [menuName, setMenuName] = useState("")
  const [menuDescription, setMenuDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach((file) => {
      const id = `file-${Date.now()}-${Math.random()}`
      const preview = URL.createObjectURL(file)

      const newFile: UploadedFile = {
        id,
        file,
        preview,
        status: "uploading",
        progress: 0,
      }

      setUploadedFiles((prev) => [...prev, newFile])

      // Simulate upload and processing
      simulateFileProcessing(id)
    })
  }

  const simulateFileProcessing = (fileId: string) => {
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId && file.status === "uploading") {
            const newProgress = Math.min(file.progress + 10, 100)
            if (newProgress === 100) {
              clearInterval(uploadInterval)
              // Start AI processing
              setTimeout(() => simulateAIProcessing(fileId), 500)
              return { ...file, progress: newProgress, status: "processing" }
            }
            return { ...file, progress: newProgress }
          }
          return file
        }),
      )
    }, 200)
  }

  const simulateAIProcessing = (fileId: string) => {
    // Simulate AI extraction
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            return {
              ...file,
              status: "completed",
              extractedItems: Math.floor(Math.random() * 20) + 5,
            }
          }
          return file
        }),
      )
    }, 3000)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate final processing
    setTimeout(() => {
      router.push(`/dashboard/menus/success?restaurant=${selectedRestaurant}&name=${encodeURIComponent(menuName)}`)
    }, 2000)
  }

  const canSubmit =
    selectedRestaurant &&
    menuName &&
    uploadedFiles.length > 0 &&
    uploadedFiles.every((file) => file.status === "completed")

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/menus">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menus
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Menu</h1>
            <p className="text-gray-600">Upload menu images and let AI extract items automatically</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Menu Details */}
          <Card>
            <CardHeader>
              <CardTitle>Menu Details</CardTitle>
              <CardDescription>Provide basic information about your menu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant</Label>
                  <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyRestaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menuName">Menu Name</Label>
                  <Input
                    id="menuName"
                    placeholder="e.g., Main Menu, Lunch Specials"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this menu..."
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Menu Images</CardTitle>
              <CardDescription>
                Upload clear photos of your menu pages. Our AI will automatically extract items, prices, and
                descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Upload Menu Images</p>
                  <p className="text-sm text-gray-500 mb-4">Drag and drop files here, or click to select</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </span>
                    </Button>
                  </Label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Uploaded Files</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uploadedFiles.map((file) => (
                        <Card key={file.id} className="relative">
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <img
                              src={file.preview || "/placeholder.svg"}
                              alt={file.file.name}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{file.file.name}</p>
                                {file.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                              </div>

                              {file.status === "uploading" && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Uploading...</span>
                                    <span>{file.progress}%</span>
                                  </div>
                                  <Progress value={file.progress} className="h-2" />
                                </div>
                              )}

                              {file.status === "processing" && (
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  AI extracting menu items...
                                </div>
                              )}

                              {file.status === "completed" && (
                                <div className="text-sm text-green-600">
                                  ✓ Extracted {file.extractedItems} menu items
                                </div>
                              )}

                              {file.status === "error" && (
                                <div className="text-sm text-red-600">✗ Processing failed</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Processing Info */}
          {uploadedFiles.some((file) => file.status === "processing") && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Our AI is analyzing your menu images and extracting items, prices, and descriptions. This usually takes
                30-60 seconds per image.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/menus">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!canSubmit || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? "Creating Menu..." : "Create Menu"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
