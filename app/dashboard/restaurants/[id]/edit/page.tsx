"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Trash2, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type Restaurant, type RestaurantUpdateRequest, type Currency } from "@/lib/api"
import { fetchPopularCurrencies } from "@/lib/currency"
import { LocaleSelect } from "@/components/ui/locale-select"

const cuisineTypes = [
  "American", "Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", "French", 
  "Mediterranean", "Greek", "Korean", "Vietnamese", "Middle Eastern", "Caribbean", 
  "Seafood", "Steakhouse", "Pizza", "Fast Casual", "Fine Dining", "Cafe", "Other"
]

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { companies } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    currency_code: "USD",
    locale: "en-US",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    hours: "",
    is_active: true,
  })

  useEffect(() => {
    loadRestaurant()
    loadCurrencies()
  }, [params.id])

  const loadCurrencies = async () => {
    try {
      const currencyList = await fetchPopularCurrencies()
      setCurrencies(currencyList)
    } catch (error) {
      console.error('Failed to load currencies:', error)
    }
  }

  const loadRestaurant = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.getRestaurant(params.id)
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        const restaurantData = response.data
        setRestaurant(restaurantData)
        
        // Populate form with existing data
        setFormData({
          name: restaurantData.name || "",
          description: restaurantData.description || "",
          cuisine: restaurantData.contact_info?.cuisine || "",
          currency_code: restaurantData.currency_code || "USD",
          locale: restaurantData.locale || "en-US",
          address: restaurantData.address?.street || "",
          city: restaurantData.address?.city || "",
          state: restaurantData.address?.state || "",
          zipCode: restaurantData.address?.zipCode || "",
          phone: restaurantData.contact_info?.phone || "",
          email: restaurantData.contact_info?.email || "",
          website: restaurantData.contact_info?.website || "",
          hours: restaurantData.contact_info?.hours || "",
          is_active: restaurantData.is_active,
        })
      }
    } catch (err) {
      setError("Failed to load restaurant. Please try again.")
      console.error("Error loading restaurant:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Restaurant name is required")
      return false
    }
    if (!formData.address.trim()) {
      setError("Address is required")
    }
    if (!formData.city.trim()) {
      setError("City is required")
      return false
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      // Prepare update data
      const updateData: RestaurantUpdateRequest = {
        name: formData.name,
        description: formData.description,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        contact_info: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          cuisine: formData.cuisine,
          hours: formData.hours,
        },
        currency_code: formData.currency_code,
        locale: formData.locale,
        is_active: formData.is_active,
      }

      const response = await apiClient.updateRestaurant(params.id, updateData)
      
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Restaurant updated successfully!")
        
        // Redirect after success
        setTimeout(() => {
          router.push(`/dashboard/restaurants/${params.id}`)
        }, 1500)
      }
    } catch (err) {
      setError("Failed to update restaurant. Please try again.")
      console.error("Error updating restaurant:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await apiClient.deleteRestaurant(params.id)
      
      if (response.error) {
        setError(response.error)
      } else {
        // Redirect to restaurants list
        router.push("/dashboard/restaurants")
      }
    } catch (err) {
      setError("Failed to delete restaurant. Please try again.")
      console.error("Error deleting restaurant:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("") // Clear error when user starts typing
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <ArrowLeft className="h-6 w-6" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !restaurant) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Restaurant</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={loadRestaurant}>Try Again</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/restaurants/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Restaurant
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Restaurant</h1>
              <p className="text-muted-foreground">Update restaurant information and settings</p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Restaurant
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>Update the details for your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Select value={formData.cuisine} onValueChange={(value) => handleInputChange("cuisine", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  placeholder="Brief description of your restaurant"
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Hours of Operation</Label>
                  <Textarea
                    id="hours"
                    value={formData.hours}
                    onChange={(e) => handleInputChange("hours", e.target.value)}
                    rows={3}
                    placeholder="Mon-Thu: 11am-10pm&#10;Fri-Sat: 11am-11pm&#10;Sun: 12pm-9pm"
                  />
                </div>
              </div>

              {/* Currency and Locale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency_code">Currency</Label>
                  <Select value={formData.currency_code} onValueChange={(value) => handleInputChange("currency_code", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale">Display Locale</Label>
                  <LocaleSelect
                    value={formData.locale}
                    onValueChange={(value) => handleInputChange("locale", value)}
                    placeholder="Select locale"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Restaurant Status</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Restaurant is active</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
