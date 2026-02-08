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
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  // Number of items extracted across the whole menu (set at finalizing step)
  itemsExtracted?: number
  // For PDFs, number of pages successfully converted/processed
  pagesProcessed?: number
  imageUrl?: string
  ocrJobId?: string
  fileType: "image" | "pdf"
  pdfInfo?: {
    pageCount: number
    fileSize: number
  }
  errorMessage?: string
  // Category for the file: 'menu' for OCR processing, 'context' for restaurant context
  category: "menu" | "context"
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

  const uploadFileToServer = async (file: File, menuId: string): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    // Use the new files endpoint that handles both images and PDFs
    const response = await apiClient.uploadMenuFiles(menuId, formData)
    if (response.error) {
      throw new Error(response.error)
    }

    return response.data!
  }

  const processWithOCR = async (imageUrls: string[], menuId: string): Promise<OCRJobResponse> => {
    const ocrResponse = await apiClient.createOCRJob(menuId, {
      image_urls: imageUrls,
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
                progress: 100
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

    for (const file of files) {
      // Validate file type
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      
      if (!isImage && !isPDF) {
        setError(`File "${file.name}" is not a supported format. Please upload images or PDF files.`)
        continue
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`)
        continue
      }

      const id = `file-${Date.now()}-${Math.random()}`
      let preview = ""
      let pdfInfo = undefined

      if (isPDF) {
        // For PDFs, use a PDF icon as preview
        preview = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDVIMjVMMzUgMTVWMzVIMTBWNVoiIGZpbGw9IiNmMzU1NDUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0yNSA1VjE1SDM1IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyMCIgeT0iMjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjgiPlBERjwvdGV4dD4KPC9zdmc+"
        
        pdfInfo = {
          pageCount: 0, // Will be updated after upload
          fileSize: file.size
        }
      } else {
        // For images, create preview URL
        preview = URL.createObjectURL(file)
      }

      const newFile: UploadedFile = {
        id,
        file,
        preview,
        status: "pending",
        progress: 0,
        fileType: isPDF ? "pdf" : "image",
        pdfInfo,
        category: "menu" // Default to menu document
      }

      setUploadedFiles((prev) => [...prev, newFile])
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

      // Upload file to server (handles both images and PDFs)
      const uploadResult = await uploadFileToServer(file, menuId)

      const isPDF = uploadResult.type === 'pdf'
      
      if (isPDF) {
        // Handle PDF processing
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: "processing", 
            progress: 70,
            pdfInfo: uploadResult.pdf_info,
            pagesProcessed: uploadResult.file_count
          } : f
        ))

        // For PDFs, process all converted images with OCR
        const imageUrls = uploadResult.files.map((fileInfo: any) => {
          const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          return fileInfo.image_url.startsWith('http') 
            ? fileInfo.image_url 
            : `${backendBaseUrl}${fileInfo.image_url}`
        })

        const ocrJob = await processWithOCR(imageUrls, menuId)
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: "processing", 
            progress: 80,
            ocrJobId: ocrJob.job_id 
          } : f
        ))

        // Start polling for OCR completion
        pollOCRStatus(ocrJob.job_id, fileId)
      } else {
        // Handle single image processing
        const imageInfo = uploadResult.files[0]
        const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const fullImageUrl = imageInfo.image_url.startsWith('http') 
          ? imageInfo.image_url 
          : `${backendBaseUrl}${imageInfo.image_url}`
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: 50, imageUrl: fullImageUrl } : f
        ))

        // Start OCR processing
        const ocrJob = await processWithOCR([fullImageUrl], menuId)
        
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
      }

    } catch (err: any) {
      console.error("Error processing file:", err)
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: "error",
          errorMessage: err.message || "Upload failed"
        } : f
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

  const updateFileCategory = (fileId: string, category: "menu" | "context") => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, category } : f))
    )
  }

  const processContextFile = async (file: File, fileId: string, restaurantId: string) => {
    try {
      // Update to uploading state
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: "uploading", progress: 30 } : f
      ))

      // Upload as context source
      const response = await apiClient.uploadSourceDocument(restaurantId, file, {
        source_category: "context"
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Update to processing state
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: "processing", progress: 60 } : f
      ))

      // Trigger processing
      if (response.data) {
        await apiClient.processSource(response.data.id)
      }

      // Mark as completed (processing happens in background)
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: "completed", progress: 100 } : f
      ))
    } catch (err: any) {
      console.error("Error processing context file:", err)
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? {
          ...f,
          status: "error",
          errorMessage: err.message || "Upload failed"
        } : f
      ))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError("")

    try {
      // Separate files by category
      const menuFiles = uploadedFiles.filter(f => f.status === "pending" && f.category === "menu")
      const contextFiles = uploadedFiles.filter(f => f.status === "pending" && f.category === "context")

      // Only create menu if there are menu files
      let menu: Menu | null = null
      if (menuFiles.length > 0) {
        menu = await createMenuFirst()
        if (!menu) {
          setError("Failed to create menu")
          setIsProcessing(false)
          return
        }
      }

      // Process all files in parallel
      const allPromises: Promise<void>[] = []

      // Process menu files with OCR pipeline
      if (menu) {
        menuFiles.forEach(file => {
          allPromises.push(processFile(file.file, file.id, menu!.id))
        })
      }

      // Process context files as restaurant sources
      contextFiles.forEach(file => {
        allPromises.push(processContextFile(file.file, file.id, selectedRestaurant))
      })

      await Promise.all(allPromises)

      // Navigate based on what was uploaded
      if (menu) {
        // Navigate to menu edit page
        router.push(`/dashboard/menus/${menu.id}/edit?fromUpload=true`)
      } else if (contextFiles.length > 0) {
        // Navigate to restaurant context page
        router.push(`/dashboard/restaurants/${selectedRestaurant}/context`)
      } else {
        // Fallback to menus page
        router.push(`/dashboard/menus`)
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsProcessing(false)
    }
  }

  // Check if there are any menu category files
  const hasMenuFiles = uploadedFiles.some(f => f.category === "menu" && f.status === "pending")

  // Menu name is only required if uploading menu files
  const canSubmit =
    Boolean(selectedRestaurant) &&
    (hasMenuFiles ? Boolean(menuName) : true) &&
    uploadedFiles.length > 0 &&
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
              <CardTitle>Upload Menu Files</CardTitle>
              <CardDescription>
                Upload clear photos of your menu pages or PDF files (max 10 pages). Our AI will automatically extract items, prices, and descriptions.
              </CardDescription>
              <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="font-medium">Best results: real dish photos</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Add a few clear photos of your top-selling dishes (no watermarks, good lighting, full plate in frame). These become the images diners see—far better than AI or generic stock.
                  </p>
                </div>
                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="font-medium">Tip</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    If you upload a PDF for text extraction, you can still upload separate real dish photos here so items get matched with accurate imagery.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Upload Menu Files</p>
                  <p className="text-sm text-gray-500 mb-4">Drag and drop images or PDF files here, or click to select</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
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
                              src={file.preview || ""}
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

                              {/* Category selector */}
                              {file.status === "pending" && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-gray-500">Category</Label>
                                  <Select
                                    value={file.category}
                                    onValueChange={(value: "menu" | "context") => updateFileCategory(file.id, value)}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="menu">Menu Document</SelectItem>
                                      <SelectItem value="context">Restaurant Context</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Show file type and PDF info */}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="capitalize">{file.fileType}</span>
                                {file.fileType === "pdf" && file.pdfInfo && (
                                  <span>• {file.pdfInfo.pageCount > 0 ? `${file.pdfInfo.pageCount} pages` : 'Processing...'}</span>
                                )}
                                <span>• {(file.file.size / 1024 / 1024).toFixed(1)}MB</span>
                              </div>

                              {file.status === "uploading" && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>{file.fileType === "pdf" ? "Uploading & converting PDF..." : "Uploading..."}</span>
                                    <span>{file.progress}%</span>
                                  </div>
                                  <Progress value={file.progress} className="h-2" />
                                </div>
                              )}

                              {file.status === "processing" && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {file.category === "context"
                                      ? "Processing context document..."
                                      : file.fileType === "pdf"
                                        ? `AI processing ${file.pdfInfo?.pageCount || 'multiple'} pages...`
                                        : "AI extracting menu items..."
                                    }
                                  </div>
                                  <Progress value={file.progress} className="h-2" />
                                </div>
                              )}

                              {file.status === "completed" && (
                                <div className="text-sm text-green-600">
                                  {file.category === "context"
                                    ? "✓ Added to restaurant context"
                                    : file.fileType === "pdf"
                                      ? `✓ ${file.pagesProcessed ?? file.pdfInfo?.pageCount ?? 0} pages processed${file.itemsExtracted !== undefined ? `, ${file.itemsExtracted} items extracted` : ""}`
                                      : (file.itemsExtracted !== undefined
                                          ? `Extracted ${file.itemsExtracted} menu items`
                                          : "✓ Processing completed")
                                  }
                                </div>
                              )}

                              {file.status === "error" && (
                                <div className="text-sm text-red-600">
                                  ✗ {file.errorMessage || "Processing failed"}
                                </div>
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/menus">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!canSubmit || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing 
                ? "Processing uploads & starting AI extraction..." 
                : createdMenu 
                ? "Process Images & Create Menu" 
                : "Create Menu"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
