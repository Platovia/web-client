"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, QrCode } from "lucide-react"

export default function SuccessPage() {
  const [userName, setUserName] = useState("")
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("userName") || ""
    const company = localStorage.getItem("companyName") || ""
    setUserName(name.split(" ")[0]) // First name only
    setCompanyName(company)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <span className="text-3xl font-bold text-gray-900">MenuAI</span>
        </div>

        <Card className="text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl mb-4">🎉 Welcome to MenuAI, {userName}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Your account is ready!</h3>
              <p className="text-gray-700 mb-4">
                <strong>{companyName}</strong> has been successfully set up with MenuAI. You can now:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Add multiple restaurants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Upload menu images</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Generate QR codes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">AI-powered chatbot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Team management</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full md:w-auto">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <div className="text-sm text-gray-600">
                <p>Need help getting started? Check out our</p>
                <Link href="/help" className="text-blue-600 hover:underline">
                  Quick Start Guide
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
