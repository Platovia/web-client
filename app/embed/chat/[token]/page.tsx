"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, ChevronUp, Minus, RotateCcw, X, Send, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import ChatStatus, { ChatStatusStream } from "@/components/ui/chat-status"
import { apiClient, type ChatMessage, type ChatSession, type ChatMessageResponse } from "@/lib/api"

// Minimal chat widget optimized for embedding inside an iframe. It reuses the
// same public chat APIs keyed by QR token and handles its own UI state.
export default function EmbeddedChatPage() {
  const { token } = useParams<{ token: string }>()
  const search = useSearchParams()

  // Theming and behavior from query params
  const accent = search?.get("color") || "#ea580c" // orange-600 default
  const position = (search?.get("position") || "bottom-right").toLowerCase()
  const welcome = search?.get("welcome") || "Hi! I'm your menu assistant. I can help you find dishes, answer questions about ingredients, dietary restrictions, and make recommendations. What would you like to know about our menu?"
  const openOnLoad = (search?.get("open") || "false").toLowerCase() === "true"

  const [showChat, setShowChat] = useState(openOnLoad)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isResettingChat, setIsResettingChat] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<any>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    if (openOnLoad) void ensureSession()
  }, [token])

  useEffect(() => {
    // notify parent about widget height for optional auto-resize
    const height = isChatMinimized ? 64 : showChat ? 520 : 64
    try {
      window.parent?.postMessage({ type: "platovia:height", height }, "*")
    } catch {}
  }, [showChat, isChatMinimized])

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
        }
      }, 100)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, isChatLoading])

  const ensureSession = async () => {
    if (!token || chatSession || isCreatingSession) return
    setIsCreatingSession(true)
    const resp = await apiClient.createChatSession(token)
    if (resp.data) {
      setChatSession(resp.data)
      // initial welcome
      setChatMessages([{ role: "assistant", content: welcome }])
      setTimeout(() => scrollToBottom(), 100)
    } else if (resp.error) {
      setSessionError("This restaurant's chat is temporarily unavailable. Please try again later.")
    }
    setIsCreatingSession(false)
  }

  const sendMessage = async () => {
    if (!token || !chatSession || !chatInput.trim()) return
    const userMessage: ChatMessage = { role: "user", content: chatInput }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput("")
    setIsChatLoading(true)
    setTimeout(() => scrollToBottom(), 50)

    try {
      // Use new status streaming endpoint for enhanced user experience  
      const { response, reader } = await apiClient.streamChatMessageWithStatus(token, chatSession.id, userMessage.content)
      if (response.ok && reader) {
        let accumulated = ""
        const decoder = new TextDecoder()
        // Optimistically add an empty assistant message that we mutate as chunks arrive
        setChatMessages(prev => [...prev, { role: "assistant", content: "" }])
        let hasAppended = false
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (!chunk) continue
          console.log('Frontend received raw chunk:', JSON.stringify(chunk), 'length:', chunk.length)
          
          // Parse SSE format: "data: {content}\n\n"
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const content = line.slice(6) // Remove "data: " prefix
              if (content) {
                try {
                  const data = JSON.parse(content)
                  console.log('SSE parsed data:', data)
                  
                  // Handle status updates
                  if (data.status && data.status !== 'heartbeat') {
                    console.log('Status update:', data.message)
                    setCurrentStatus(data)
                    continue
                  }
                  
                  // Handle final response
                  if (data.type === 'response' && data.data) {
                    const finalResponse = data.data.bot_response || ''
                    const responseTime = data.data.response_time_ms
                    setChatMessages(prev => {
                      const copy = [...prev]
                      for (let i = copy.length - 1; i >= 0; i--) {
                        if (copy[i].role === 'assistant') { 
                          copy[i] = { 
                            role: 'assistant', 
                            content: finalResponse,
                            responseTime: responseTime
                          }
                          hasAppended = true
                          break
                        }
                      }
                      return copy
                    })
                    break
                  }
                } catch (e) {
                  // Fallback: treat as plain text content for compatibility
                  console.log('Fallback parsing as plain text:', content)
                  accumulated += content
                  setChatMessages(prev => {
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
              }
            }
          }
        }
        if (!hasAppended && accumulated) {
          setChatMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
        }
      } else {
        // Fallback to non-streaming JSON API
        const resp = await apiClient.sendChatMessage(token, chatSession.id, userMessage.content)
        if (resp.data) {
          const assistantMessage: ChatMessage = { 
            role: "assistant", 
            content: resp.data.bot_response,
            responseTime: resp.data.response_time_ms
          }
          setChatMessages(prev => [...prev, assistantMessage])
        } else if (resp.error) {
          setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }])
        }
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, there was an error." }])
    } finally {
      setIsChatLoading(false)
      setCurrentStatus(null)
      setTimeout(() => scrollToBottom(), 100)
    }
  }

  const resetChat = async () => {
    if (!chatSession || isResettingChat) return
    setIsResettingChat(true)
    try {
      const resp = await apiClient.resetChatSession(chatSession.id)
      if (resp.data?.new_session) {
        setChatSession(resp.data.new_session)
        setChatMessages([{ role: "assistant", content: welcome }])
      }
    } finally {
      setIsResettingChat(false)
    }
  }

  const headerStyle: React.CSSProperties = { backgroundColor: accent }

  const wrapperPosClass = position === "bottom-left" ? "left-4" : "right-4"

  const formatMessage = (content: string) => (
    <ReactMarkdown className="prose prose-sm">
      {content}
    </ReactMarkdown>
  )

  return (
    <div className={`fixed bottom-4 ${wrapperPosClass} z-50 font-sans`}> 
      {!showChat ? (
        <Button
          onClick={() => {
            setShowChat(true)
            void ensureSession()
          }}
          className="text-white rounded-full p-4 shadow-lg"
          style={{ backgroundColor: accent }}
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${isChatMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'} flex flex-col`}>
          <div className="flex items-center justify-between px-8 p-3 text-white rounded-t-lg" style={headerStyle}>
            <h3 className="font-semibold text-sm">Menu Assistant</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={resetChat} disabled={!chatSession || isResettingChat} className="text-white hover:bg-black/10 h-6 w-6 p-0" title="Reset chat">
                <RotateCcw className={`h-3 w-3 ${isResettingChat ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsChatMinimized(!isChatMinimized)} className="text-white hover:bg-black/10 h-6 w-6 p-0">
                {isChatMinimized ? <ChevronUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="text-white hover:bg-black/10 h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isChatMinimized && (
            <>
              <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
                {!chatSession && isCreatingSession && !sessionError && (
                  <div className="text-center text-gray-500 py-6">Connecting to menu assistant...</div>
                )}
                {sessionError && (
                  <div className="text-center py-6 px-4">
                    <div className="text-red-500 mb-2">
                      <AlertCircle className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-600">{sessionError}</p>
                  </div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`} style={m.role === 'user' ? { backgroundColor: accent } : {}}>
                      {m.role === 'assistant' ? formatMessage(m.content) : m.content}
                      {m.role === 'assistant' && m.responseTime && (
                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                          Response time: {(m.responseTime / 1000).toFixed(2)}s
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && chatSession && token && (
                  <ChatStatusStream 
                    sessionId={chatSession.id} 
                    qrToken={token}
                    isVisible={true} 
                    className="px-3 py-2"
                    currentStatus={currentStatus}
                  />
                )}
              </div>
              <div className="p-3 border-t bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                  <Input placeholder={sessionError ? "Chat unavailable" : !chatSession ? "Connecting..." : "Ask about our menu..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={!chatSession || isChatLoading || isCreatingSession || !!sessionError} className="text-sm" />
                  <Button onClick={sendMessage} disabled={!chatSession || isChatLoading || !chatInput.trim() || !!sessionError} size="sm" style={{ backgroundColor: accent }} className="text-white">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">AI Assistant · Responses may contain inaccuracies</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}


