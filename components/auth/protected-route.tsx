"use client"

import type React from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Bypass all authentication checks for now
  return <>{children}</>
}
