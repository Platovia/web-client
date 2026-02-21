import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QrCode } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <QrCode className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Platovia</span>
        </div>

        <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
