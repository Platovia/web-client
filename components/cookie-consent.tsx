"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const accept = (value: "all" | "necessary") => {
    localStorage.setItem("cookie-consent", value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t shadow-lg p-4 md:p-6">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            We use essential cookies for authentication and core functionality. No third-party tracking cookies are used.
            Learn more in our{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => accept("necessary")}>
            Necessary Only
          </Button>
          <Button size="sm" onClick={() => accept("all")}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}
