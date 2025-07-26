import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { menuId } = await request.json()

    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
    }

    // Get authentication token from request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Call backend API to generate QR code
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/v1/qr/menus/${menuId}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        regenerate: false,
        expires_in_days: 365
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.detail || "Failed to generate QR code" }, { status: response.status })
    }

    const qrData = await response.json()
    return NextResponse.json(qrData)
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
