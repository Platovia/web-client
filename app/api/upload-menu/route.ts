import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const restaurantId = formData.get("restaurantId") as string

    if (!file || !restaurantId) {
      return NextResponse.json({ error: "Missing file or restaurant ID" }, { status: 400 })
    }

    // In a real implementation, you would upload to Supabase Storage or another service
    // For demo purposes, we'll use a placeholder URL
    const imageUrl = `/placeholder.svg?height=400&width=600&query=menu page ${file.name}`
    return NextResponse.json({ restaurant_id: restaurantId, image_url: imageUrl, image_name: file.name })
  } catch (error) {
    console.error("Error uploading menu image:", error)
    return NextResponse.json({ error: "Failed to upload menu image" }, { status: 500 })
  }
}
