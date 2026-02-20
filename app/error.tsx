'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <QrCode className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">MenuAI</span>
        </div>

        <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
