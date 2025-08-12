"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TagList } from "@/components/ui/tag-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, Search, Leaf, Wheat, Heart, Send, X, AlertCircle, ChevronUp, Minus, RotateCcw, Store } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { apiClient, type MenuItem, type ChatMessage, type ChatSession, type ChatMessageResponse, type ChatSessionResetResponse } from "@/lib/api"
import { MenuRenderer } from "@/components/menu-renderer"
import { formatPrice } from "@/lib/currency"
import { resolveImageUrl } from "@/lib/utils"

interface Restaurant {
  id: string
  name: string
  description?: string
  logo_url?: string
  address?: any
  contact_info?: any
  currency_code?: string
  locale?: string
}

export default function MenuPage({ params }: { params: { restaurantId: string } | Promise<{ restaurantId: string }> }) {
  const searchParams = useSearchParams()
  const qrToken = searchParams?.get('token')
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showChat, setShowChat] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [error, setError] = useState("")
  const [menuId, setMenuId] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)
  const [themeConfig, setThemeConfig] = useState<any | null>(null)
  const [layoutConfig, setLayoutConfig] = useState<any | null>(null)
  const [layoutStatus, setLayoutStatus] = useState<string | undefined>(undefined)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isResettingChat, setIsResettingChat] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string>("")
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initParams = async () => {
      const resolved = (typeof (params as any)?.then === "function") ? await (params as Promise<{ restaurantId: string }>) : (params as { restaurantId: string })
      setRestaurantId(resolved.restaurantId)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (qrToken || restaurantId) {
      loadMenuData()
    }
  }, [restaurantId, qrToken])

  useEffect(() => {
    filterItems()
  }, [menuItems, searchQuery, selectedCategory])

  // Auto-scroll to bottom when chat messages change
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
        }
      }, 100) // Small delay to ensure DOM has updated
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isChatLoading])

  // Also scroll to bottom when chat opens or expands
  useEffect(() => {
    if (showChat && !isChatMinimized) {
      scrollToBottom()
    }
  }, [showChat, isChatMinimized])

  const loadMenuData = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (qrToken) {
        // Load via QR token (preferred method)
        const response = await apiClient.getPublicMenu(qrToken)
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          const { menu, menu_items } = response.data
          
          setMenuId(menu.id)
          setTemplateId(menu.template_id)
          setThemeConfig(menu.theme_config || null)
          setLayoutConfig(menu.layout_config || null)
          setLayoutStatus(menu.layout_status)
          setRestaurant({
            id: menu.restaurant?.id || '',
            name: menu.restaurant?.name || 'Unknown Restaurant',
            description: menu.restaurant?.description || '',
            logo_url: menu.restaurant?.logo_url,
            address: menu.restaurant?.address,
            contact_info: menu.restaurant?.contact_info,
            currency_code: menu.restaurant?.currency_code || 'USD',
            locale: menu.restaurant?.locale || 'en-US'
          })
          
          // Transform menu items to include dietary flags (for backward compatibility)
          const transformedItems = menu_items.map(item => ({
            ...item,
            // Use tags if available, otherwise fall back to allergens-based logic
            is_vegetarian: item.tags ? item.tags.includes('vegetarian') : 
              item.allergens ? !item.allergens.some(a => 
                ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'].includes(a.toLowerCase())
              ) : false,
            is_vegan: item.tags ? item.tags.includes('vegan') :
              item.allergens ? !item.allergens.some(a => 
                ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'dairy', 'eggs', 'honey'].includes(a.toLowerCase())
              ) : false,
            is_gluten_free: item.tags ? item.tags.includes('gluten_free') :
              item.allergens ? !item.allergens.includes('gluten') : false
          }))
          
          setMenuItems(transformedItems)
          setFilteredItems(transformedItems)
        }
      } else {
        // Fallback: try to get restaurant info directly (less secure)
        const restaurantResponse = await apiClient.getRestaurant(restaurantId)
        
        if (restaurantResponse.error) {
          setError("Restaurant not found or not accessible")
                 } else if (restaurantResponse.data) {
           setRestaurant({
             id: restaurantResponse.data.id,
             name: restaurantResponse.data.name,
             description: restaurantResponse.data.description || '',
             address: restaurantResponse.data.address,
             contact_info: restaurantResponse.data.contact_info
           })
           // Note: This approach doesn't load menu items as it requires authentication
           setError("To view the menu, please scan the QR code provided by the restaurant")
         }
      }
    } catch (err) {
      setError("Failed to load menu. Please try again.")
      console.error("Error loading menu:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = menuItems

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category || "Other").filter(Boolean)))]

  const createChatSession = async () => {
    if (!qrToken || chatSession) return
    
    setIsCreatingSession(true)
    try {
      const response = await apiClient.createChatSession(qrToken)
      if (response.data) {
        setChatSession(response.data)
        
        // Try to load existing chat history for this session
        const historyResponse = await apiClient.getChatHistory(response.data.id)
        
        if (historyResponse.data && historyResponse.data.messages.length > 0) {
          // Convert history to chat messages format
          const historyMessages: ChatMessage[] = historyResponse.data.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.type === 'user' ? msg.message : (msg.response || msg.message)
          }))
          setChatMessages(historyMessages)
        } else {
          // No history found - this is a new session, add welcome message
          const welcomeMessage: ChatMessage = {
            role: "assistant",
            content: "Hi! I'm your menu assistant. I can help you find dishes, answer questions about ingredients, dietary restrictions, and make recommendations. What would you like to know about our menu?"
          }
          setChatMessages([welcomeMessage])
          setTimeout(() => scrollToBottom(), 100)
        }
      } else {
        console.error("Failed to create chat session:", response.error)
      }
    } catch (err) {
      console.error("Error creating chat session:", err)
    } finally {
      setIsCreatingSession(false)
    }
  }

  const formatMessage = (content: string) => {
    return (
      <ReactMarkdown
        className="prose prose-sm"
        components={{
          strong: ({ children }: { children: React.ReactNode }) => (
          <strong className="font-semibold">{children}</strong>
        ),
          li: ({ children }: { children: React.ReactNode }) => (
            <li className="mb-1">{children}</li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !qrToken || !chatSession) return

    const userMessage: ChatMessage = { role: "user", content: chatInput }
    setChatMessages((prev) => [...prev, userMessage])
    const toSend = chatInput
    setChatInput("")
    setIsChatLoading(true)
    setTimeout(() => scrollToBottom(), 50)

    try {
      // Prefer streaming for instant feedback
      const { response, reader } = await apiClient.streamChatMessage(qrToken, chatSession.id, toSend)
      if (response.ok && reader) {
        const decoder = new TextDecoder()
        let accumulated = ""
        let hasAppended = false
        // Add empty assistant message to update incrementally
        setChatMessages((prev) => [...prev, { role: "assistant", content: "" }])
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (!chunk) continue
          console.log('Frontend received chunk:', JSON.stringify(chunk), 'length:', chunk.length)
          accumulated += chunk
          setChatMessages((prev) => {
            const copy = [...prev]
            for (let i = copy.length - 1; i >= 0; i--) {
              if (copy[i].role === 'assistant') { 
                copy[i] = { role: 'assistant', content: accumulated }
                hasAppended = true
                break
              }
            }
            return copy
          })
        }
        if (!hasAppended && accumulated) {
          setChatMessages((prev) => [...prev, { role: 'assistant', content: accumulated }])
        }
        setTimeout(() => scrollToBottom(), 100)
      } else {
        // Fallback to non-streaming JSON API
        const resp = await apiClient.sendChatMessage(qrToken, chatSession.id, toSend)
        if (resp.error) {
          if (resp.error.includes("expired") || resp.error.includes("inactivity")) {
            setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Your chat session has expired due to inactivity. Please reset the chat to continue our conversation!' }])
          } else {
            setChatMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting to our menu assistant right now. Please feel free to browse our menu or ask our staff for help!" }])
          }
        } else if (resp.data) {
          setChatMessages((prev) => [...prev, { role: 'assistant', content: resp.data.bot_response }])
        }
        setTimeout(() => scrollToBottom(), 100)
      }
    } catch (err) {
      console.error("Chat error:", err)
      setChatMessages((prev) => [...prev, { role: 'assistant', content: "I'm sorry, there was an error processing your message. Please try again." }])
      setTimeout(() => scrollToBottom(), 100)
    } finally {
      setIsChatLoading(false)
    }
  }

  const resetChat = async () => {
    if (!chatSession || isResettingChat) return

    setIsResettingChat(true)
    
    try {
      const response = await apiClient.resetChatSession(chatSession.id)
      
      if (response.data) {
        // Update with new session
        setChatSession(response.data.new_session)
        // Clear chat messages to start fresh
        setChatMessages([])
        // Add a welcome message
        const welcomeMessage: ChatMessage = {
          role: "assistant",
          content: "Hi! I'm your menu assistant. I can help you find dishes, answer questions about ingredients, dietary restrictions, and make recommendations. What would you like to know about our menu?"
        }
        setChatMessages([welcomeMessage])
        setTimeout(() => scrollToBottom(), 100)
      } else {
        // If reset fails, try creating a new session
        await createChatSession()
      }
    } catch (err) {
      console.error("Reset chat error:", err)
      // Fallback to creating a new session
      await createChatSession()
    } finally {
      setIsResettingChat(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Menu</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <MenuRenderer
          templateId={templateId}
          restaurant={{
            id: restaurant?.id || "",
            name: restaurant?.name || "",
            description: restaurant?.description,
            logo_url: restaurant?.logo_url,
            currency_code: restaurant?.currency_code,
            locale: restaurant?.locale,
          }}
          items={filteredItems.length ? filteredItems : menuItems}
          themeConfig={themeConfig}
          layoutConfig={layoutStatus === "published" ? layoutConfig : null}
          mode={layoutStatus === "published" && layoutConfig ? "builder" : "template"}
          categories={categories.filter((c) => c !== "All")}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onChangeCategory={setSelectedCategory}
          onChangeSearch={setSearchQuery}
        />
      </div>

      {/* Chat Button - only show if we have a QR token */}
      {qrToken && (
        <Button
          onClick={() => {
            setShowChat(true)
            if (!chatSession && !isCreatingSession) {
              createChatSession()
            }
          }}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-orange-600 hover:bg-orange-700"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Modal */}
      {/* Chat Widget - Bottom Right Position */}
      <div className="fixed bottom-4 right-4 z-50">
        {!showChat ? (
          /* Minimized Chat Button */
          <Button
            onClick={() => {
              setShowChat(true)
              setIsChatMinimized(false)
              if (qrToken && !chatSession) {
                createChatSession()
              }
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg"
            size="lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          /* Chat Widget */
          <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
            isChatMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          } flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-orange-600 text-white rounded-t-lg">
              <h3 className="font-semibold text-sm">Menu Assistant</h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetChat}
                  disabled={isResettingChat || !chatSession}
                  className="text-white hover:bg-orange-700 h-6 w-6 p-0"
                  title="Reset chat"
                >
                  <RotateCcw className={`h-3 w-3 ${isResettingChat ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                  className="text-white hover:bg-orange-700 h-6 w-6 p-0"
                >
                  {isChatMinimized ? 
                    <ChevronUp className="h-3 w-3" /> : 
                    <Minus className="h-3 w-3" />
                  }
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-orange-700 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chat Content - Only show when not minimized */}
            {!isChatMinimized && (
              <>
                <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
                  {isCreatingSession && (
                    <div className="text-center text-gray-500 py-6">
                      <div className="flex space-x-1 justify-center mb-3">
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
                      <p className="text-sm">Connecting to menu assistant...</p>
                    </div>
                  )}

                  {!isCreatingSession && chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 py-6">
                      <MessageCircle className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Ask me anything about our menu!</p>
                      <p className="text-xs mt-1 text-gray-400">
                        I can help with ingredients, allergens, recommendations, and more.
                      </p>
                    </div>
                  )}

                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-sm ${
                          message.role === "user" 
                            ? "bg-orange-600 text-white rounded-br-sm" 
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        {message.role === "assistant" ? formatMessage(message.content) : message.content}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
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

                {/* Input Section */}
                <div className="p-3 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex gap-2">
                    <Input
                      placeholder={isCreatingSession ? "Connecting..." : "Ask about our menu..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      disabled={isChatLoading || isCreatingSession || !chatSession}
                      className="text-sm"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={isChatLoading || isCreatingSession || !chatSession || !chatInput.trim()}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
