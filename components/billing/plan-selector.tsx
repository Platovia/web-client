"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import type { BillingPlan } from "@/lib/api"

interface PlanSelectorProps {
  currentTier: string
  plans: BillingPlan[]
  onSelectPlan: (priceId: string) => void
  cancelAtPeriodEnd?: boolean
  className?: string
}

const TIER_ORDER = ["free", "starter", "growth", "enterprise"]

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

function formatLimit(value: number): string {
  if (value === -1) return "Unlimited"
  return value.toLocaleString()
}

export function PlanSelector({
  currentTier,
  plans,
  onSelectPlan,
  cancelAtPeriodEnd = false,
  className,
}: PlanSelectorProps) {
  const currentTierIndex = TIER_ORDER.indexOf(currentTier)

  const sortedPlans = [...plans].sort((a, b) => {
    return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  })

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {sortedPlans.map((plan) => {
        const planIndex = TIER_ORDER.indexOf(plan.tier)
        const isCurrentPlan = plan.tier === currentTier
        const isUpgrade = planIndex > currentTierIndex
        const isDowngrade = planIndex < currentTierIndex
        const isFree = plan.tier === "free"

        return (
          <Card
            key={plan.tier}
            className={cn(
              "relative flex flex-col",
              isCurrentPlan && "border-2 border-primary"
            )}
          >
            {isCurrentPlan && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Current Plan
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="capitalize">{plan.tier}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Conversations</span>
                  <span className="font-medium">
                    {formatLimit(plan.limits.conversations)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Restaurants</span>
                  <span className="font-medium">
                    {formatLimit(plan.limits.restaurants)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Menus per Restaurant</span>
                  <span className="font-medium">
                    {formatLimit(plan.limits.menus_per_restaurant)}
                  </span>
                </li>
              </ul>
              <div className="mt-4">
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : isFree && isDowngrade && cancelAtPeriodEnd ? (
                  <Button variant="outline" className="w-full text-amber-600" disabled>
                    Cancellation Scheduled
                  </Button>
                ) : isFree && isDowngrade ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Downgrade to Free
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Downgrade to Free?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will lose access to your current plan features at the end of your billing period. This action schedules a cancellation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Current Plan</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onSelectPlan("free")}>
                          Yes, Downgrade
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : isFree ? (
                  <Button variant="outline" className="w-full" disabled>
                    Free Tier
                  </Button>
                ) : isUpgrade ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" disabled={!plan.paddle_price_id}>
                        Upgrade
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Upgrade to {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be upgraded to the {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} plan at {formatPrice(plan.price)}/month. Your billing will be adjusted with proration.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => plan.paddle_price_id && onSelectPlan(plan.paddle_price_id)}>
                          Yes, Upgrade
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : isDowngrade ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="secondary" className="w-full" disabled={!plan.paddle_price_id}>
                        Downgrade
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Downgrade to {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be downgraded to the {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} plan at {formatPrice(plan.price)}/month. You may lose access to features available on your current plan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Current Plan</AlertDialogCancel>
                        <AlertDialogAction onClick={() => plan.paddle_price_id && onSelectPlan(plan.paddle_price_id)}>
                          Yes, Downgrade
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
