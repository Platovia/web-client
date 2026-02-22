"use client"

import type React from "react"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Eye, EyeOff, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.resetPassword(token!, password)
      if (response.error) {
        setError(response.error)
      } else {
        setIsSuccess(true)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength meter
  const renderPasswordStrength = () => {
    if (!password) return null
    const pw = password
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
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><QrCode className="h-5 w-5 text-primary-foreground" /></div>
              <span className="text-2xl font-bold text-foreground">Platovia</span>
            </Link>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/forgot-password">
                <Button>Request New Reset Link</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><QrCode className="h-5 w-5 text-primary-foreground" /></div>
              <span className="text-2xl font-bold text-foreground">Platovia</span>
            </Link>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been updated. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/auth/login">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><QrCode className="h-5 w-5 text-primary-foreground" /></div>
            <span className="text-2xl font-bold text-foreground">Platovia</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Set new password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {renderPasswordStrength()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4"><QrCode className="h-5 w-5 text-primary-foreground" /></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
