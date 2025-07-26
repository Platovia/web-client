"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RefreshCw, Loader2, CheckCircle, AlertTriangle, FileText, Edit, Save } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { apiClient, type Menu, type OCRJobResponse, type OCRResultResponse } from "@/lib/api"

interface OCRJobWithResults {
  job: OCRJobResponse
  results: OCRResultResponse[]
}

export default function MenuOCRPage() {
  const params = useParams()
  const menuId = params.id as string

  const [menu, setMenu] = useState<Menu | null>(null)
  const [ocrJobs, setOcrJobs] = useState<OCRJobWithResults[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [editingResult, setEditingResult] = useState<OCRResultResponse | null>(null)
  const [editText, setEditText] = useState("")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    loadMenuAndOCRData()
  }, [menuId])

  const loadMenuAndOCRData = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Load menu details
      const menuResponse = await apiClient.getMenu(menuId)
      if (menuResponse.error) {
        setError("Failed to load menu: " + menuResponse.error)
        return
      }
      
      setMenu(menuResponse.data!)

      // Note: The backend doesn't have a direct endpoint to get all OCR jobs for a menu
      // In a real implementation, you'd want to add this endpoint
      // For now, we'll show a placeholder
      setOcrJobs([])
      
    } catch (err) {
      console.error("Error loading OCR data:", err)
      setError("Failed to load OCR data")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOCRData = async () => {
    setIsRefreshing(true)
    await loadMenuAndOCRData()
    setIsRefreshing(false)
  }

  const processOCRJob = async (jobId: string) => {
    try {
      const response = await apiClient.processOCRJob(jobId)
      if (response.error) {
        setError("Failed to process OCR job: " + response.error)
      } else {
        await refreshOCRData()
      }
    } catch (err) {
      console.error("Error processing OCR job:", err)
      setError("Failed to process OCR job")
    }
  }

  const saveOCRCorrection = async () => {
    if (!editingResult) return

    try {
      const response = await apiClient.updateOCRResult(editingResult.id, {
        corrected_text: editText,
        correction_notes: editNotes
      })

      if (response.error) {
        setError("Failed to save correction: " + response.error)
      } else {
        // Update local state
        setOcrJobs(prev => prev.map(job => ({
          ...job,
          results: job.results.map(result => 
            result.id === editingResult.id ? response.data! : result
          )
        })))
        setEditingResult(null)
        setEditText("")
        setEditNotes("")
      }
    } catch (err) {
      console.error("Error saving correction:", err)
      setError("Failed to save correction")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/menus/${menuId}/edit`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">OCR Processing</h1>
              <p className="text-gray-600">Loading OCR data...</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/menus/${menuId}/edit`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">OCR Processing</h1>
              <p className="text-gray-600">
                OCR jobs for menu: <span className="font-medium">{menu?.name}</span>
              </p>
            </div>
          </div>
          <Button onClick={refreshOCRData} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {ocrJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No OCR Jobs Found</h3>
              <p className="text-gray-600 mb-4">
                No OCR processing jobs have been created for this menu yet.
              </p>
              <p className="text-sm text-gray-500">
                OCR jobs are automatically created when you upload menu images.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {ocrJobs.map((jobData, index) => (
              <Card key={jobData.job.job_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        OCR Job #{index + 1}
                        <Badge className={getStatusColor(jobData.job.status)}>
                          {jobData.job.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Created: {new Date(jobData.job.created_at).toLocaleString()}
                        {jobData.job.processing_completed_at && (
                          <span className="ml-4">
                            Completed: {new Date(jobData.job.processing_completed_at).toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {jobData.job.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => processOCRJob(jobData.job.job_id)}
                      >
                        Process Now
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round(jobData.job.progress_percentage)}%</span>
                      </div>
                      <Progress value={jobData.job.progress_percentage} />
                    </div>

                    {/* Job Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{jobData.job.total_images}</p>
                        <p className="text-sm text-gray-600">Total Images</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{jobData.job.processed_images}</p>
                        <p className="text-sm text-gray-600">Processed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{jobData.results.length}</p>
                        <p className="text-sm text-gray-600">Results</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {jobData.results.filter(r => r.is_manually_corrected).length}
                        </p>
                        <p className="text-sm text-gray-600">Corrected</p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {jobData.job.error_message && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{jobData.job.error_message}</AlertDescription>
                      </Alert>
                    )}

                    {/* Results */}
                    {jobData.results.length > 0 && (
                      <Tabs defaultValue="results" className="mt-6">
                        <TabsList>
                          <TabsTrigger value="results">OCR Results</TabsTrigger>
                          <TabsTrigger value="corrections">Manual Corrections</TabsTrigger>
                        </TabsList>

                        <TabsContent value="results" className="space-y-4">
                          {jobData.results.map((result) => (
                            <Card key={result.id}>
                              <CardContent className="pt-6">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {result.extraction_method || 'Unknown'}
                                      </Badge>
                                      {result.confidence_score && (
                                        <Badge variant="outline">
                                          {result.confidence_score}% confidence
                                        </Badge>
                                      )}
                                      {result.is_manually_corrected && (
                                        <Badge className="bg-green-100 text-green-800">
                                          Manually Corrected
                                        </Badge>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingResult(result)
                                        setEditText(result.corrected_text || result.raw_text || "")
                                        setEditNotes(result.correction_notes || "")
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </div>

                                  {result.image_url && (
                                    <div className="w-full max-w-md">
                                      <img
                                        src={result.image_url}
                                        alt="OCR Source"
                                        className="w-full border rounded-lg"
                                      />
                                    </div>
                                  )}

                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Raw OCR Text</Label>
                                      <Textarea
                                        value={result.raw_text || "No text extracted"}
                                        readOnly
                                        className="mt-1 bg-gray-50"
                                        rows={6}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">
                                        {result.is_manually_corrected ? "Corrected Text" : "Structured Data"}
                                      </Label>
                                      <Textarea
                                        value={
                                          result.corrected_text ||
                                          JSON.stringify(result.structured_data, null, 2) ||
                                          "No structured data"
                                        }
                                        readOnly
                                        className="mt-1 bg-gray-50 font-mono text-sm"
                                        rows={6}
                                      />
                                    </div>
                                  </div>

                                  {result.correction_notes && (
                                    <div>
                                      <Label className="text-sm font-medium">Correction Notes</Label>
                                      <p className="text-sm text-gray-600 mt-1">{result.correction_notes}</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>

                        <TabsContent value="corrections">
                          <div className="space-y-4">
                            {jobData.results.filter(r => r.is_manually_corrected).length === 0 ? (
                              <p className="text-gray-600 text-center py-8">
                                No manual corrections have been made yet.
                              </p>
                            ) : (
                              jobData.results
                                .filter(r => r.is_manually_corrected)
                                .map((result) => (
                                  <Card key={result.id}>
                                    <CardContent className="pt-6">
                                      <div className="space-y-2">
                                        <h4 className="font-medium">Correction for Image</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-sm">Original Text</Label>
                                            <Textarea
                                              value={result.raw_text || ""}
                                              readOnly
                                              className="mt-1 bg-gray-50"
                                              rows={4}
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-sm">Corrected Text</Label>
                                            <Textarea
                                              value={result.corrected_text || ""}
                                              readOnly
                                              className="mt-1 bg-gray-50"
                                              rows={4}
                                            />
                                          </div>
                                        </div>
                                        {result.correction_notes && (
                                          <div>
                                            <Label className="text-sm">Notes</Label>
                                            <p className="text-sm text-gray-600">{result.correction_notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit OCR Result</CardTitle>
                <CardDescription>
                  Manually correct the OCR text extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Original OCR Text</Label>
                    <Textarea
                      value={editingResult.raw_text || ""}
                      readOnly
                      className="mt-1 bg-gray-50"
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label>Corrected Text</Label>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="mt-1"
                      rows={8}
                      placeholder="Enter the corrected text..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Correction Notes</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Add notes about the corrections made..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingResult(null)
                      setEditText("")
                      setEditNotes("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveOCRCorrection}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Correction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 