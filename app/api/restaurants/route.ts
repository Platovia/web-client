import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Supabase removed; return empty list
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()
    return NextResponse.json({ id: "temp", name, description, logo_url: "/restaurant-logo.png" })
  } catch (error) {
    console.error("Error creating restaurant:", error)
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 })
  }
}
