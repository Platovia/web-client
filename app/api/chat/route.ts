import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, restaurantId, menuItems } = await request.json()

    const menuContext = menuItems
      .map(
        (item: any) =>
          `${item.name} - ${item.description} - $${item.price} - Category: ${item.category}${
            item.is_vegetarian ? " (Vegetarian)" : ""
          }${item.is_vegan ? " (Vegan)" : ""}${
            item.is_gluten_free ? " (Gluten Free)" : ""
          }${item.allergens?.length ? ` - Allergens: ${item.allergens.join(", ")}` : ""}`,
      )
      .join("\n")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a helpful restaurant assistant. You have access to the complete menu and can answer questions about ingredients, allergens, recommendations, prices, and dietary restrictions. Be friendly, knowledgeable, and concise.

Menu Items:
${menuContext}

Guidelines:
- Always be helpful and friendly
- Provide specific information about menu items when asked
- Make recommendations based on dietary preferences
- Alert customers about allergens when relevant
- Keep responses conversational and not too long
- If asked about something not on the menu, politely explain it's not available`,
      prompt: message,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
