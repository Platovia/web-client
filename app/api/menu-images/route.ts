import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Supabase removed; return empty list
    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching menu images:", error)
    return NextResponse.json({ error: "Failed to fetch menu images" }, { status: 500 })
  }
}
