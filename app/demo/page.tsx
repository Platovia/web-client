"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Search, Leaf, Wheat, Heart, Send, X, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  allergens: string[]
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// Demo data
const demoRestaurant = {
  id: "demo",
  name: "Bella Vista Restaurant",
  description: "Authentic Italian cuisine with a modern twist",
  logo_url: "/placeholder.svg?height=100&width=100",
}

const demoMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, basil on wood-fired crust",
    price: 18.99,
    category: "Pizza",
    allergens: ["gluten", "dairy"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
  },
  {
    id: "2",
    name: "Spaghetti Carbonara",
    description: "Eggs, pancetta, parmesan, black pepper with fresh pasta",
    price: 22.99,
    category: "Pasta",
    allergens: ["gluten", "dairy", "eggs"],
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan, caesar dressing",
    price: 14.99,
    category: "Salads",
    allergens: ["dairy"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
  },
  {
    id: "4",
    name: "Vegan Buddha Bowl",
    description: "Quinoa, roasted vegetables, avocado, tahini dressing",
    price: 16.99,
    category: "Salads",
    allergens: ["sesame"],
    is_vegetarian: true,
    is_vegan: true,
    is_gluten_free: true,
  },
  {
    id: "5",
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon herb butter and seasonal vegetables",
    price: 28.99,
    category: "Main Course",
    allergens: ["fish"],
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: true,
  },
  {
    id: "6",
    name: "Tiramisu",
    description: "Coffee-soaked ladyfingers, mascarpone, cocoa powder",
    price: 8.99,
    category: "Desserts",
    allergens: ["gluten", "dairy", "eggs"],
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
  },
]

export default function DemoPage() {
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(demoMenuItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    filterItems()
  }, [searchQuery, selectedCategory])

  const filterItems = () => {
    let filtered = demoMenuItems

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const categories = ["All", ...Array.from(new Set(demoMenuItems.map((item) => item.category)))]

  const sendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help you with our menu! What would you like to know?",
        "Our Margherita Pizza is very popular and perfect for vegetarians!",
        "For vegan options, I recommend our Vegan Buddha Bowl - it's delicious and nutritious.",
        "If you have any allergies, please let me know and I can suggest suitable dishes.",
        "Our Grilled Salmon is gluten-free and pairs wonderfully with our seasonal vegetables.",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const assistantMessage: ChatMessage = { role: "assistant", content: randomResponse }
      setChatMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Demo Menu Experience</h1>
                <p className="text-blue-100 text-sm">Experience how your customers will see your menu</p>
              </div>
            </div>
            <Link href="/auth/register">
              <Button variant="secondary">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Restaurant Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img
              src={demoRestaurant.logo_url || "/placeholder.svg"}
              alt={demoRestaurant.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{demoRestaurant.name}</h1>
              <p className="text-gray-600">{demoRestaurant.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <span className="text-lg font-bold text-blue-600">${item.price.toFixed(2)}</span>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  {item.is_vegetarian && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetarian
                    </Badge>
                  )}
                  {item.is_vegan && (
                    <Badge variant="outline" className="text-green-700 border-green-700">
                      <Heart className="h-3 w-3 mr-1" />
                      Vegan
                    </Badge>
                  )}
                  {item.is_gluten_free && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Wheat className="h-3 w-3 mr-1" />
                      Gluten Free
                    </Badge>
                  )}
                </div>
                {item.allergens && item.allergens.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Allergens: {item.allergens.join(", ")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items found matching your search.</p>
          </div>
        )}
      </div>

      {/* Chat Button */}
      <Button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md h-96 md:h-[500px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Menu Assistant (Demo)</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Ask me anything about our menu!</p>
                  <p className="text-sm mt-2">I can help with ingredients, allergens, recommendations, and more.</p>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about our menu..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
