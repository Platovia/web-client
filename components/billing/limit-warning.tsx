"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface LimitWarningProps {
  resourceName: string
  used: number
  limit: number
  tier: string
}

export function LimitWarning({ resourceName, used, limit, tier }: LimitWarningProps) {
  return (
    <Alert variant="destructive" className="border-red-300 bg-red-50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-1">
        <span>
          You&apos;ve reached the {resourceName} limit for your <strong>{tier}</strong> plan ({used}/{limit}).
        </span>
        <Link
          href="/dashboard/settings/billing"
          className="text-red-700 underline underline-offset-2 hover:text-red-900 text-sm font-medium w-fit"
        >
          Upgrade your plan
        </Link>
      </AlertDescription>
    </Alert>
  )
}
