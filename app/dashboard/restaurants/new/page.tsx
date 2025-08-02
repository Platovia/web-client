"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MapPin, Clock, AlertCircle, Loader2, Camera, Upload, Phone, Globe } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type RestaurantCreateRequest, type Currency } from "@/lib/api"
import { fetchPopularCurrencies } from "@/lib/currency"
import { LocaleSelect } from "@/components/ui/locale-select"

const cuisineTypes = [
  "American", "Italian", "Chinese", "Japanese", "Mexican", "Indian", "Thai", "French", 
  "Mediterranean", "Greek", "Korean", "Vietnamese", "Middle Eastern", "Caribbean", 
  "Seafood", "Steakhouse", "Pizza", "Fast Casual", "Fine Dining", "Cafe", "Other"
]

const stateOptions = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", 
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", 
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", 
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

export default function NewRestaurantPage() {
  const router = useRouter()
  const { companies } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
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
    hours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "23:00", closed: false },
      saturday: { open: "09:00", close: "23:00", closed: false },
      sunday: { open: "10:00", close: "21:00", closed: false },
    },
  })

  useEffect(() => {
    loadCurrencies()
  }, [])

  const loadCurrencies = async () => {
    try {
      const currencyList = await fetchPopularCurrencies()
      setCurrencies(currencyList)
    } catch (error) {
      console.error('Failed to load currencies:', error)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Restaurant name is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    if (!formData.cuisine) {
      setError("Please select a cuisine type")
      return false
    }
    if (!formData.address.trim() || !formData.city.trim()) {
      setError("Address and city are required")
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

    if (!validateForm()) {
      return
    }

    if (!companies || companies.length === 0) {
      setError("No company found. Please contact support.")
      return
    }

    setIsLoading(true)

    try {
      const company = companies[0] // Use the first company
      
      // Prepare restaurant data for API
      const restaurantPayload: RestaurantCreateRequest = {
        name: formData.name,
        description: formData.description,
        currency_code: formData.currency_code,
        locale: formData.locale,
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
        }
      }
      
      // Create restaurant via API
      const response = await apiClient.createRestaurant(company.id, restaurantPayload)
      
      if (response.error) {
        setError(response.error)
        return
      }
      
      // Success - redirect to restaurant detail page
      router.push(`/dashboard/restaurants/${response.data?.id}?created=true`)
      
    } catch (err) {
      setError("Failed to create restaurant. Please try again.")
      console.error("Restaurant creation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/restaurants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Restaurants
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Restaurant</h1>
            <p className="text-gray-600">Create a new restaurant location</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter restaurant name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type *</Label>
                  <Select
                    value={formData.cuisine}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, cuisine: value }))}
                  >
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency_code}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, currency_code: value }))}
                  >
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
                  <Label htmlFor="locale">Display Locale *</Label>
                  <LocaleSelect
                    value={formData.locale}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, locale: value }))}
                    placeholder="Select locale"
                    detectDefault={true}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your restaurant's atmosphere, specialties, and unique features"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Restaurant Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Upload your restaurant logo</p>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>Where customers can find your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>How customers can reach your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@restaurant.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://yourrestaurant.com"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>Set your restaurant's operating schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(formData.hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <Label className="capitalize font-medium">{day}</Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hours: {
                              ...prev.hours,
                              [day]: { ...prev.hours[day as keyof typeof prev.hours], open: e.target.value },
                            },
                          }))
                        }
                        disabled={hours.closed}
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hours: {
                              ...prev.hours,
                              [day]: { ...prev.hours[day as keyof typeof prev.hours], close: e.target.value },
                            },
                          }))
                        }
                        disabled={hours.closed}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant={hours.closed ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            hours: {
                              ...prev.hours,
                              [day]: { ...prev.hours[day as keyof typeof prev.hours], closed: !hours.closed },
                            },
                          }))
                        }
                      >
                        {hours.closed ? "Closed" : "Open"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/restaurants">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Restaurant
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
