"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QrCode, ArrowRight, ArrowLeft, Check, Loader2, Plus, Trash2, Copy, ExternalLink, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, OnboardingSourceInput } from "@/lib/api"
import { SourceProgress } from "@/components/onboarding/source-progress"

interface LinkItem {
  id: string
  url: string
  category: 'menu' | 'context'
}

const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false
  try {
    const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`
    new URL(urlWithProtocol)
    return true
  } catch {
    return false
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { companies } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    cuisine: "",
    website: "",
  })
  const [links, setLinks] = useState<LinkItem[]>([])

  // Step 4 state
  const [setupComplete, setSetupComplete] = useState(false)
  const [sourceIds, setSourceIds] = useState<string[]>([])
  const [embedSnippet, setEmbedSnippet] = useState("")
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [hasFailedSources, setHasFailedSources] = useState(false)
  const [copied, setCopied] = useState(false)

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("restaurantOnboardingData")
    if (savedData) {
      setRestaurantData(JSON.parse(savedData))
    }

    const savedStep = localStorage.getItem("onboardingStep")
    if (savedStep) {
      const step = Number.parseInt(savedStep)
      // Don't restore to step 4 as that requires API call
      if (step <= 3) {
        setCurrentStep(step)
      }
    }

    const savedLinks = localStorage.getItem("onboardingLinks")
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks))
    }
  }, [])

  // Save data on every change
  useEffect(() => {
    localStorage.setItem("restaurantOnboardingData", JSON.stringify(restaurantData))
    if (currentStep <= 3) {
      localStorage.setItem("onboardingStep", currentStep.toString())
    }
  }, [restaurantData, currentStep])

  useEffect(() => {
    localStorage.setItem("onboardingLinks", JSON.stringify(links))
  }, [links])

  // Form validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return restaurantData.name.trim().length > 0
      case 2:
        return true // All fields optional
      case 3:
        // Validate URLs if any are provided
        return links.every(link => !link.url.trim() || isValidUrl(link.url))
      case 4:
        return true
      default:
        return false
    }
  }

  const getValidLinks = (): OnboardingSourceInput[] => {
    return links
      .filter(link => link.url.trim() && isValidUrl(link.url))
      .map(link => {
        let url = link.url.trim()
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`
        }
        return {
          url,
          category: link.category
        }
      })
  }

  const addLink = () => {
    setLinks(prev => [
      ...prev,
      { id: crypto.randomUUID(), url: "", category: "menu" }
    ])
  }

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id))
  }

  const updateLink = (id: string, field: 'url' | 'category', value: string) => {
    setLinks(prev => prev.map(link => {
      if (link.id === id) {
        if (field === 'category') {
          return { ...link, [field]: value as 'menu' | 'context' }
        }
        return { ...link, [field]: value }
      }
      return link
    }))
  }

  const handleQuickSetup = async () => {
    if (!companies || companies.length === 0) {
      setError("No company found. Please contact support.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const validLinks = getValidLinks()

      const response = await apiClient.quickSetup({
        restaurant_name: restaurantData.name.trim(),
        sources: validLinks,
      })

      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        setSetupComplete(true)
        setRestaurantId(response.data.restaurant_id)
        setEmbedSnippet(response.data.embed_snippet)
        setSourceIds(response.data.source_ids)

        // If no sources, mark as complete immediately
        if (response.data.source_ids.length === 0) {
          setProcessingComplete(true)
        }

        // Clean up localStorage
        localStorage.removeItem("onboardingStep")
        localStorage.removeItem("restaurantOnboardingData")
        localStorage.removeItem("onboardingLinks")
      }
    } catch (err) {
      setError("Failed to set up your restaurant. Please try again.")
      console.error("Quick setup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    setError("")

    if (currentStep < totalSteps) {
      if (!validateStep(currentStep)) {
        if (currentStep === 1) {
          setError("Please enter your restaurant name")
        } else if (currentStep === 3) {
          setError("Please enter valid URLs for all links")
        }
        return
      }
      setCurrentStep(currentStep + 1)

      // Trigger API call when entering step 4
      if (currentStep === 3) {
        handleQuickSetup()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1 && !setupComplete) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRetry = () => {
    setSetupComplete(false)
    setError("")
    handleQuickSetup()
  }

  const handleSourcesComplete = () => {
    setProcessingComplete(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const goToDashboard = () => {
    if (restaurantId) {
      router.push(`/dashboard/restaurants/${restaurantId}`)
    } else {
      router.push("/dashboard")
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to MenuAI!</h2>
              <p className="text-muted-foreground">Let's set up your first restaurant</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Enter restaurant name"
                value={restaurantData.name}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your restaurant (optional)"
                value={restaurantData.description}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input
                id="cuisine"
                placeholder="e.g., Italian, Mexican, Asian (optional)"
                value={restaurantData.cuisine}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, cuisine: e.target.value }))}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
              <p className="text-muted-foreground">Add your restaurant's contact details (all optional)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                value={restaurantData.address}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, address: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={restaurantData.phone}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourrestaurant.com"
                value={restaurantData.website}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Add Your Links</h2>
              <p className="text-muted-foreground">Provide URLs to your menu or restaurant info</p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
              <p className="text-primary">
                <strong>Menu:</strong> Links to your menu pages or PDFs for the AI chatbot to learn your dishes.
              </p>
              <p className="text-primary mt-1">
                <strong>General Info:</strong> Links to pages about hours, location, policies, etc.
              </p>
            </div>

            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="https://example.com/menu"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      className={link.url && !isValidUrl(link.url) ? "border-red-300" : ""}
                    />
                    {link.url && !isValidUrl(link.url) && (
                      <p className="text-xs text-red-500">Please enter a valid URL</p>
                    )}
                  </div>
                  <Select
                    value={link.category}
                    onValueChange={(value) => updateLink(link.id, 'category', value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menu">Menu</SelectItem>
                      <SelectItem value="context">General Info</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(link.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addLink}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add another link
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This step is optional. You can add more links later from your dashboard.
            </p>
          </div>
        )
      case 4:
        // API error state - show retry option
        if (!setupComplete && error) {
          return (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Setup Failed</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleRetry} className="mt-4">
                Try Again
              </Button>
            </div>
          )
        }

        // Loading state
        if (isLoading) {
          return (
            <div className="space-y-4 text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h2 className="text-xl font-bold">Setting up your restaurant...</h2>
              <p className="text-muted-foreground">This will only take a moment</p>
            </div>
          )
        }

        // Processing sources state
        if (setupComplete && sourceIds.length > 0 && !processingComplete) {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Processing Your Links</h2>
                <p className="text-muted-foreground">We're extracting information from your sources</p>
              </div>
              <SourceProgress
                sourceIds={sourceIds}
                onAllComplete={handleSourcesComplete}
              />
              <p className="text-xs text-muted-foreground text-center">
                You can wait or proceed to the next step
              </p>
              <Button onClick={() => setProcessingComplete(true)} variant="outline" className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )
        }

        // Success state - show embed snippet
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Chatbot is Ready!</h2>
              <p className="text-muted-foreground">Embed it on your website with the code below</p>
            </div>

            {hasFailedSources && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Some sources failed to process. You can retry them from your dashboard.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Embed Code</Label>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{embedSnippet}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button onClick={goToDashboard} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const canGoNext = () => {
    if (currentStep === 4) return false
    if (currentStep === 1) return restaurantData.name.trim().length > 0
    if (currentStep === 3) {
      return links.every(link => !link.url.trim() || isValidUrl(link.url))
    }
    return true
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4"><QrCode className="h-5 w-5 text-primary-foreground" /></div>
          <span className="text-2xl font-bold text-foreground">MenuAI</span>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}

            {error && currentStep !== 4 && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep < 4 && (
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isLoading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isLoading || !canGoNext()}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentStep === 3 ? "Complete Setup" : "Next"}
                  {currentStep < 3 && !isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
