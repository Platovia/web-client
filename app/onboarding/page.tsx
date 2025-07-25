"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { QrCode, ArrowRight, ArrowLeft, Check } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    cuisine: "",
    website: "",
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  // Add useEffect to load saved data
  useEffect(() => {
    const savedData = localStorage.getItem("restaurantOnboardingData")
    if (savedData) {
      setRestaurantData(JSON.parse(savedData))
    }

    const savedStep = localStorage.getItem("onboardingStep")
    if (savedStep) {
      setCurrentStep(Number.parseInt(savedStep))
    }
  }, [])

  // Save data on every change
  useEffect(() => {
    localStorage.setItem("restaurantOnboardingData", JSON.stringify(restaurantData))
    localStorage.setItem("onboardingStep", currentStep.toString())
  }, [restaurantData, currentStep])

  // Add form validation for each step
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return restaurantData.name.trim() && restaurantData.description.trim() && restaurantData.cuisine.trim()
      case 2:
        return restaurantData.address.trim() && restaurantData.phone.trim()
      case 3:
        return true
      default:
        return false
    }
  }

  // Update handleNext with validation
  const handleNext = () => {
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1)
      } else {
        // Show validation error
        return
      }
    } else {
      // Complete onboarding with success animation
      localStorage.setItem("onboardingComplete", "true")
      localStorage.setItem(
        "firstRestaurant",
        JSON.stringify({
          id: "first-restaurant",
          ...restaurantData,
          createdAt: new Date().toISOString(),
        }),
      )
      localStorage.removeItem("onboardingStep")
      localStorage.removeItem("restaurantOnboardingData")
      router.push("/dashboard?welcome=true")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to MenuAI!</h2>
              <p className="text-gray-600">Let's set up your first restaurant to get started</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                placeholder="Enter restaurant name"
                value={restaurantData.name}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, name: e.target.value }))}
              />
              {currentStep === 1 && !restaurantData.name.trim() && (
                <p className="text-sm text-red-600 mt-1">Restaurant name is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your restaurant"
                value={restaurantData.description}
                onChange={(e) => setRestaurantData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input
                id="cuisine"
                placeholder="e.g., Italian, Mexican, Asian"
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
              <p className="text-gray-600">Add your restaurant's contact details</p>
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
              <Label htmlFor="website">Website (Optional)</Label>
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
            {currentStep === 3 && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">🎉 You're All Set!</h2>
                <p className="text-gray-600">Your restaurant has been created successfully</p>
              </div>
            )}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{restaurantData.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{restaurantData.description}</p>
                <p className="text-sm text-gray-600">{restaurantData.cuisine} Cuisine</p>
              </CardContent>
            </Card>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload your menu images</li>
                <li>• Generate QR codes for your tables</li>
                <li>• Customize your menu display</li>
                <li>• Set up the AI chatbot</li>
              </ul>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <QrCode className="h-8 w-8 text-blue-600 mx-auto mb-4" />
          <span className="text-2xl font-bold text-gray-900">MenuAI</span>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
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

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === totalSteps ? "Complete Setup" : "Next"}
                {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
