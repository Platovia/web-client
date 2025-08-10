"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Copy, Check, ExternalLink, Eye } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function MenuEmbedSnippetPage() {
  const { id } = useParams<{ id: string }>()
  const [token, setToken] = useState<string | null>(null)
  const [color, setColor] = useState("#ea580c")
  const [position, setPosition] = useState("bottom-right")
  const [open, setOpen] = useState(false)
  const [welcome, setWelcome] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const qr = await apiClient.getQRCodeInfo(id)
        if (qr.data?.token) {
          setToken(qr.data.token)
        } else {
          setError("No QR token found. Please generate a QR code first.")
        }
      } catch (err) {
        console.error("Failed to load QR token:", err)
        setError("Failed to load QR token")
      } finally {
        setIsLoading(false)
      }
    }
    if (id) void load()
  }, [id])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  const scriptSnippet = useMemo(() => {
    if (!token) return ""
    
    const attrs = [
      `src="${appUrl}/menuai-widget.js"`,
      `data-token="${token}"`,
      `data-color="${color}"`,
      `data-position="${position}"`,
      `data-open="${open}"`,
      welcome ? `data-welcome="${welcome.replace(/"/g, '&quot;')}"` : undefined,
      "async",
    ].filter(Boolean).join(' ')
    
    return `<script ${attrs}></script>`
  }, [token, color, position, open, welcome, appUrl])

  const previewUrl = useMemo(() => {
    if (!token) return ""
    const params = new URLSearchParams({
      color: color,
      position: position,
      open: open.toString(),
      ...(welcome && { welcome })
    })
    return `${appUrl}/embed/chat/${token}?${params.toString()}`
  }, [token, color, position, open, welcome, appUrl])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scriptSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/menus/${id}/qr`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to QR Code
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Embed Chatbot</h1>
              <p className="text-gray-600">Loading embed configuration...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/menus/${id}/qr`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to QR Code
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Embed Chatbot</h1>
            <p className="text-gray-600">
              Generate an embed code to add the menu chatbot to any website
            </p>
          </div>
          {previewUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(previewUrl, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!token && !isLoading && (
          <Alert>
            <AlertDescription>
              You need to generate a QR code first to get an embed token.{' '}
              <Link href={`/dashboard/menus/${id}/qr`} className="underline">
                Go to QR Code page
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {token && (
          <>
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Customize Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="flex-1"
                        placeholder="#ea580c"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="open">Open on Load</Label>
                    <Select value={open.toString()} onValueChange={val => setOpen(val === 'true')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Closed (Recommended)</SelectItem>
                        <SelectItem value="true">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome">Welcome Message (Optional)</Label>
                    <Input
                      id="welcome"
                      value={welcome}
                      onChange={e => setWelcome(e.target.value)}
                      placeholder="Hi! Ask me about our menu..."
                      maxLength={100}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Code */}
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="snippet">Copy this code and paste it before the closing &lt;/body&gt; tag on your website:</Label>
                  <div className="relative">
                    <Textarea
                      id="snippet"
                      readOnly
                      className="font-mono text-xs bg-gray-50 min-h-[120px] pr-12"
                      value={scriptSnippet}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                      disabled={!token}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Instructions:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Copy the code above</li>
                    <li>Paste it into your website's HTML, just before the closing &lt;/body&gt; tag</li>
                    <li>The chatbot will appear automatically on your site</li>
                    <li>Customers can ask questions about your menu and get instant answers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview Info */}
            <Card>
              <CardHeader>
                <CardTitle>Preview & Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Direct Embed URL (for testing)</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={previewUrl}
                      className="flex-1 text-sm bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(previewUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Note:</strong> The chatbot will use the same menu data and AI responses as your QR code menu. Make sure your menu is active and up-to-date before embedding.</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
