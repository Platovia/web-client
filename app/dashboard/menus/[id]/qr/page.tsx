"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, RefreshCw, QrCode, ExternalLink, Copy, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { apiClient, type Menu, type QRCodeResponse } from "@/lib/api"

export default function MenuQRPage() {
  const params = useParams()
  const router = useRouter()
  const menuId = params.id as string

  const [menu, setMenu] = useState<Menu | null>(null)
  const [qrInfo, setQrInfo] = useState<QRCodeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadMenuAndQR()
  }, [menuId])

  const loadMenuAndQR = async () => {
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

      // Try to load existing QR code
      const qrResponse = await apiClient.getQRCodeInfo(menuId)
      if (qrResponse.data) {
        setQrInfo(qrResponse.data)
      }
    } catch (err) {
      console.error("Error loading menu and QR:", err)
      setError("Failed to load menu information")
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async (regenerate: boolean = false) => {
    setIsGenerating(true)
    setError("")

    try {
      const response = await apiClient.generateQRCode(menuId, {
        regenerate,
        expires_in_days: 365
      })

      if (response.error) {
        setError("Failed to generate QR code: " + response.error)
      } else if (response.data) {
        setQrInfo(response.data)
      }
    } catch (err) {
      console.error("Error generating QR code:", err)
      setError("Failed to generate QR code")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadQRCode = async () => {
    if (!qrInfo?.qr_code_url) return

    try {
      const response = await fetch(qrInfo.qr_code_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${menu?.name || 'menu'}-qr-code.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading QR code:", err)
      setError("Failed to download QR code")
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/menus">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menus
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code</h1>
              <p className="text-gray-600">Loading menu QR code...</p>
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
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/menus">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menus
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code</h1>
            <p className="text-gray-600">
              QR code for menu: <span className="font-medium">{menu?.name}</span>
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
              <CardDescription>
                Customers can scan this QR code to view your menu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrInfo ? (
                <>
                  <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                    <img
                      src={qrInfo.qr_code_url}
                      alt="Menu QR Code"
                      className="w-64 h-64 border rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => generateQRCode(true)}
                      variant="outline"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Code Generated</h3>
                  <p className="text-gray-600 mb-4">
                    Generate a QR code for customers to access this menu
                  </p>
                  <Button
                    onClick={() => generateQRCode(false)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Information */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Details</CardTitle>
              <CardDescription>
                Information about your menu QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrInfo ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Public Menu URL</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={qrInfo.public_menu_url}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(qrInfo.public_menu_url)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(qrInfo.public_menu_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {qrInfo.token && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Access Token</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={qrInfo.token}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(qrInfo.token)}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {qrInfo.expires_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expires</label>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(qrInfo.expires_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Print and place the QR code on tables</li>
                      <li>• Customers scan to view the menu instantly</li>
                      <li>• No app download required</li>
                      <li>• Works on all smartphones</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">
                  Generate a QR code to see detailed information here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Status */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Status</CardTitle>
            <CardDescription>
              Current status of this menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={menu?.is_active ? "default" : "secondary"}>
                  {menu?.is_active ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-gray-600">
                  {menu?.is_active 
                    ? "Menu is live and accessible via QR code"
                    : "Menu is inactive and not accessible to customers"
                  }
                </span>
              </div>
              {menu && (
                <Link href={`/dashboard/menus/${menu.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Menu
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 