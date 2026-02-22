"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Eye, EyeOff, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setError("Company name is required")
      return false
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and last name are required")
      return false
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await register(
        {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
        formData.companyName
      )

      if (response.error) {
        setError(response.error)
      } else {
        // Successful registration - redirect to onboarding or dashboard
        router.push("/onboarding")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loading = isLoading || authLoading

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><QrCode className="h-5 w-5 text-primary-foreground" /></div>
            <span className="text-2xl font-bold text-foreground">Platovia</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground">Get started for free</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your account to get started with Platovia</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.password && (() => {
                  const pw = formData.password
                  let score = 0
                  if (pw.length >= 8) score += 1
                  if (pw.length >= 12) score += 1
                  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1
                  if (/\d/.test(pw)) score += 1
                  if (/[^a-zA-Z0-9]/.test(pw)) score += 1
                  const capped = Math.min(score, 4)

                  const label = ["Weak", "Weak", "Fair", "Good", "Strong"][capped]
                  const barColors = [
                    ["bg-muted", "bg-muted", "bg-muted"],
                    ["bg-red-500", "bg-muted", "bg-muted"],
                    ["bg-yellow-500", "bg-yellow-500", "bg-muted"],
                    ["bg-yellow-500", "bg-yellow-500", "bg-green-400"],
                    ["bg-green-500", "bg-green-500", "bg-green-500"],
                  ][capped]

                  const hints: string[] = []
                  if (pw.length < 8) hints.push("8+ characters")
                  if (!/[A-Z]/.test(pw)) hints.push("uppercase")
                  if (!/[a-z]/.test(pw)) hints.push("lowercase")
                  if (!/\d/.test(pw)) hints.push("number")
                  if (!/[^a-zA-Z0-9]/.test(pw)) hints.push("special character")

                  return (
                    <div className="mt-1">
                      <div className="flex gap-1">
                        <div className={`h-1 w-full rounded ${barColors[0]}`} />
                        <div className={`h-1 w-full rounded ${barColors[1]}`} />
                        <div className={`h-1 w-full rounded ${barColors[2]}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {label} password
                        {capped < 4 && hints.length > 0 && ` — add ${hints.join(", ")}`}
                      </p>
                    </div>
                  )
                })()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline"
                  tabIndex={loading ? -1 : 0}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
