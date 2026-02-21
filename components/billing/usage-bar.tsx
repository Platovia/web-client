"use client"

import { cn } from "@/lib/utils"

interface UsageBarProps {
  label: string
  used: number
  limit: number
  className?: string
}

export function UsageBar({ label, used, limit, className }: UsageBarProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100)

  const getBarColor = () => {
    if (isUnlimited) return "bg-primary"
    if (percentage >= 95) return "bg-red-500"
    if (percentage >= 80) return "bg-amber-500"
    return "bg-primary"
  }

  const formatLimit = () => {
    if (isUnlimited) return "Unlimited"
    return limit.toLocaleString()
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {formatLimit()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all", getBarColor())}
          style={{ width: isUnlimited ? "100%" : `${percentage}%` }}
        />
      </div>
    </div>
  )
}
