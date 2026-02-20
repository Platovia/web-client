"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type BillingSubscription, type BillingUsage, type BillingPlan } from "@/lib/api"
import { UsageBar } from "@/components/billing/usage-bar"
import { PlanSelector } from "@/components/billing/plan-selector"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (env: "sandbox" | "production") => void
      }
      Initialize: (options: { token?: string }) => void
      Checkout: {
        open: (options: {
          items?: { priceId: string; quantity: number }[]
          settings?: {
            successUrl?: string
            displayMode?: "overlay" | "inline"
          }
          customer?: { email?: string }
          customData?: Record<string, string>
        }) => void
      }
    }
  }
}

export default function BillingPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [usage, setUsage] = useState<BillingUsage | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBillingData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [subRes, usageRes, plansRes] = await Promise.all([
        apiClient.getSubscription(),
        apiClient.getUsage(),
        apiClient.getPlans(),
      ])

      if (subRes.error) {
        setError(subRes.error)
        return
      }
      if (usageRes.error) {
        setError(usageRes.error)
        return
      }
      if (plansRes.error) {
        setError(plansRes.error)
        return
      }

      setSubscription(subRes.data || null)
      setUsage(usageRes.data || null)
      setPlans(plansRes.data?.plans || [])
    } catch (err) {
      setError("Failed to load billing data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [])

  const handleSelectPlan = async (priceId: string) => {
    try {
      const res = await apiClient.updatePlan({ price_id: priceId })
      if (res.error) {
        toast({ title: "Plan change failed", description: res.error })
        return
      }

      const data = res.data
      if (!data) {
        toast({ title: "Error", description: "No response from server" })
        return
      }

      if (data.action === "checkout_required") {
        // Free -> Paid: open Paddle checkout overlay
        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
        if (window.Paddle && clientToken) {
          const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox"
          window.Paddle.Environment.set(paddleEnv)
          window.Paddle.Initialize({ token: clientToken })

          window.Paddle.Checkout.open({
            transactionId: data.client_token,
            settings: {
              displayMode: "overlay",
              successUrl: window.location.href,
            },
          })
        } else if (data.checkout_url) {
          window.location.href = data.checkout_url
        } else {
          toast({ title: "Checkout unavailable", description: "Paddle.js is not loaded. Please refresh and try again." })
        }
      } else if (data.action === "updated") {
        toast({ title: "Plan Updated", description: data.message })
        await fetchBillingData()
      } else if (data.action === "canceled") {
        toast({ title: "Downgrade Scheduled", description: data.message })
        await fetchBillingData()
      } else if (data.action === "no_change") {
        toast({ title: "No Change", description: data.message })
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update plan" })
    }
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    try {
      const res = await apiClient.cancelSubscription()
      if (res.error) {
        toast({ title: "Cancellation failed", description: res.error })
        return
      }
      toast({ title: "Subscription canceled", description: "Your subscription will end at the current billing period." })
      await fetchBillingData()
    } catch (err) {
      toast({ title: "Error", description: "Failed to cancel subscription" })
    } finally {
      setIsCanceling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      past_due: "bg-amber-100 text-amber-800",
      trialing: "bg-blue-100 text-blue-800",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const isPaidTier = subscription && subscription.tier !== "free"

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600">Manage your subscription and view usage</p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchBillingData}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your current plan and billing details</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold capitalize">{subscription.tier} Plan</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                      {isPaidTier && !subscription.cancel_at_period_end && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isCanceling}>
                              {isCanceling ? "Canceling..." : "Cancel Subscription"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period on {formatDate(subscription.current_period_end)}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction onClick={handleCancelSubscription}>
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    {isPaidTier && (
                      <div className="text-sm text-muted-foreground">
                        {subscription.cancel_at_period_end ? (
                          <p className="text-amber-600">
                            Your subscription will end on {formatDate(subscription.current_period_end)}
                          </p>
                        ) : (
                          <p>Renews on {formatDate(subscription.current_period_end)}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No subscription information available</p>
                )}
              </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
              <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Your current usage for this billing period</CardDescription>
              </CardHeader>
              <CardContent>
                {usage ? (
                  <div className="space-y-4">
                    <UsageBar
                      label="Conversations"
                      used={usage.usage.conversations || 0}
                      limit={usage.limits.conversations || 0}
                    />
                    <UsageBar
                      label="Restaurants"
                      used={usage.usage.restaurants || 0}
                      limit={usage.limits.restaurants || 0}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No usage data available</p>
                )}
              </CardContent>
            </Card>

            {/* Plan Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Choose the plan that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                {plans.length > 0 ? (
                  <PlanSelector
                    currentTier={subscription?.tier || "free"}
                    plans={plans}
                    onSelectPlan={handleSelectPlan}
                    cancelAtPeriodEnd={subscription?.cancel_at_period_end}
                  />
                ) : (
                  <p className="text-muted-foreground">No plans available</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
