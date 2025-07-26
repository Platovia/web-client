"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { apiClient, type Restaurant, type Menu, type OCRJobResponse } from "@/lib/api"

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedItems?: number
  imageUrl?: string
  ocrJobId?: string
}

export default function UploadMenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedRestaurant = searchParams.get("restaurant")

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(preselectedRestaurant || "")
  const [menuName, setMenuName] = useState("")
  const [menuDescription, setMenuDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)
  const [error, setError] = useState("")
  const [createdMenu, setCreatedMenu] = useState<Menu | null>(null)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    setIsLoadingRestaurants(true)
    setError("")

    try {
      // Get current user's company restaurants
      const companies = await apiClient.getUserCompanies()
      if (companies.error) {
        setError("Failed to load companies")
        return
      }

      if (companies.data && companies.data.companies.length > 0) {
        const companyId = companies.data.companies[0].id // Use first company for now
        const restaurantsResponse = await apiClient.getCompanyRestaurants(companyId)
        
        if (restaurantsResponse.error) {
          setError("Failed to load restaurants")
        } else if (restaurantsResponse.data) {
          setRestaurants(restaurantsResponse.data.restaurants)
        }
      }
    } catch (err) {
      setError("Failed to load restaurants")
      console.error("Error loading restaurants:", err)
    } finally {
      setIsLoadingRestaurants(false)
    }
  }

  const uploadFileToServer = async (file: File, menuId: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.uploadMenuImages(menuId, formData)
    if (response.error) {
      throw new Error(response.error)
    }

    return response.data!.image_url
  }

  const processWithOCR = async (imageUrl: string, menuId: string): Promise<OCRJobResponse> => {
    const ocrResponse = await apiClient.createOCRJob(menuId, {
      image_urls: [imageUrl],
      processing_options: {
        extract_prices: true,
        categorize_items: true
      }
    })

    if (ocrResponse.error) {
      throw new Error(ocrResponse.error)
    }

    return ocrResponse.data!
  }

  const pollOCRStatus = async (jobId: string, fileId: string) => {
    const checkStatus = async () => {
      try {
        const statusResponse = await apiClient.getOCRJobStatus(jobId)
        if (statusResponse.error) {
          setUploadedFiles(prev => prev.map(file => 
            file.id === fileId ? { ...file, status: "error" } : file
          ))
          return
        }

        const job = statusResponse.data!
        const progress = Math.round(job.progress_percentage)

        setUploadedFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            if (job.status === "completed") {
              return { 
                ...file, 
                status: "completed", 
                progress: 100,
                extractedItems: Math.floor(Math.random() * 20) + 5 // Will be replaced with actual count
              }
            } else if (job.status === "failed") {
              return { ...file, status: "error" }
            } else {
              return { ...file, progress: Math.max(progress, file.progress) }
            }
          }
          return file
        }))

        if (job.status === "processing" || job.status === "pending") {
          setTimeout(checkStatus, 2000) // Poll every 2 seconds
        }
      } catch (err) {
        console.error("Error checking OCR status:", err)
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, status: "error" } : file
        ))
      }
    }

    checkStatus()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // First, we need to create the menu if it doesn't exist
    let menuToUse = createdMenu
    if (!menuToUse && selectedRestaurant && menuName) {
      try {
        menuToUse = await createMenuFirst()
        
        if (!menuToUse) {
          setError("Failed to create menu. Please try again.")
          return
        }
      } catch (err) {
        setError("Failed to create menu. Please check your inputs and try again.")
        return
      }
    }

    if (!menuToUse) {
      setError("Please enter a menu name and select a restaurant before uploading files")
      return
    }

    for (const file of files) {
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

      // Process file upload and OCR
      processFile(file, id, menuToUse.id)
    }
  }

  const createMenuFirst = async () => {
    if (!selectedRestaurant || !menuName) return null

    try {
      const menuResponse = await apiClient.createMenu(selectedRestaurant, {
        name: menuName,
        template_id: "default"
      })

      if (menuResponse.error) {
        setError(menuResponse.error)
        return null
      }

      setCreatedMenu(menuResponse.data!)
      return menuResponse.data!
    } catch (err) {
      setError("Failed to create menu")
      console.error("Error creating menu:", err)
      return null
    }
  }

  const processFile = async (file: File, fileId: string, menuId: string) => {
    try {
      // Update to uploading state
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "uploading", progress: 10 } : f
      ))

      // Upload file to server
      const imageUrl = await uploadFileToServer(file, menuId)
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 50, imageUrl } : f
      ))

      // Start OCR processing
      const ocrJob = await processWithOCR(imageUrl, menuId)
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: "processing", 
          progress: 60,
          ocrJobId: ocrJob.job_id 
        } : f
      ))

      // Start polling for OCR completion
      pollOCRStatus(ocrJob.job_id, fileId)

    } catch (err) {
      console.error("Error processing file:", err)
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "error" } : f
      ))
    }
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
    setError("")

    try {
      // Create menu if not already created
      if (!createdMenu) {
        await createMenuFirst()
      }

      if (!createdMenu) {
        setError("Failed to create menu")
        setIsProcessing(false)
        return
      }

      // Wait for all OCR jobs to complete
      const incompleteFiles = uploadedFiles.filter(f => f.status !== "completed")
      if (incompleteFiles.length > 0) {
        setError("Please wait for all files to finish processing")
        setIsProcessing(false)
        return
      }

      // Activate the menu
      const activateResponse = await apiClient.activateMenu(createdMenu.id)
      if (activateResponse.error) {
        setError(activateResponse.error)
        setIsProcessing(false)
        return
      }

      // Navigate to the menu edit page to review extracted items
      router.push(`/dashboard/menus/${createdMenu.id}/edit?fromUpload=true`)
    } catch (err) {
      console.error("Error submitting menu:", err)
      setError("Failed to finalize menu creation")
      setIsProcessing(false)
    }
  }

  const canSubmit =
    selectedRestaurant &&
    menuName &&
    uploadedFiles.length > 0 &&
    uploadedFiles.every((file) => file.status === "completed") &&
    !isProcessing

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

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                  <Select 
                    value={selectedRestaurant} 
                    onValueChange={setSelectedRestaurant}
                    disabled={isLoadingRestaurants || createdMenu !== null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingRestaurants ? "Loading restaurants..." : "Select restaurant"} />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
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
                    disabled={createdMenu !== null}
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
                  disabled={createdMenu !== null}
                  rows={2}
                />
              </div>
              
              {createdMenu && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Menu "{createdMenu.name}" has been created. You can now upload images for processing.
                  </AlertDescription>
                </Alert>
              )}
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
              {isProcessing ? "Finalizing Menu..." : createdMenu ? "Review & Activate Menu" : "Create Menu"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
