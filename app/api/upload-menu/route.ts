import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    const { data, error } = await supabase
      .from("menu_images")
      .insert([
        {
          restaurant_id: restaurantId,
          image_url: imageUrl,
          image_name: file.name,
          category: "Menu",
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error uploading menu image:", error)
    return NextResponse.json({ error: "Failed to upload menu image" }, { status: 500 })
  }
}
