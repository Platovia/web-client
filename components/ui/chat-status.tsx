"use client"

import { useEffect, useState } from "react"
import { Loader2, Search, Brain, Lightbulb, Database, Globe } from "lucide-react"

interface ChatStatusProps {
  isVisible: boolean
  className?: string
}

interface StatusUpdate {
  status: string
  message: string
  detail?: string
  progress?: number
  timestamp: string
}

// Status type mappings for icons and styling
const STATUS_CONFIG = {
  thinking: {
    icon: Brain,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    label: "Thinking"
  },
  searching_menu: {
    icon: Database,
    color: "text-green-500", 
    bgColor: "bg-green-50",
    label: "Searching Menu"
  },
  searching_web: {
    icon: Globe,
    color: "text-purple-500",
    bgColor: "bg-purple-50", 
    label: "Searching Web"
  },
  analyzing: {
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    label: "Analyzing"
  },
  finding_items: {
    icon: Search,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "Finding Items"
  },
  generating_response: {
    icon: Loader2,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    label: "Generating Response"
  },
  preparing_context: {
    icon: Database,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    label: "Preparing Context"
  },
  checking_cache: {
    icon: Search,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    label: "Checking Cache"
  },
  processing_tools: {
    icon: Brain,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    label: "Processing Tools"
  },
  building_menu_outline: {
    icon: Database,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    label: "Building Menu Outline"
  },
  fetching_restaurant_info: {
    icon: Database,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    label: "Fetching Restaurant Info"
  }
}

export default function ChatStatus({ isVisible, className = "" }: ChatStatusProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusUpdate | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Simulate status updates for demo purposes
  useEffect(() => {
    if (!isVisible) {
      setCurrentStatus(null)
      return
    }

    // Demo status sequence
    const statusSequence = [
      { status: "checking_cache", message: "Checking cached responses...", delay: 500 },
      { status: "searching_menu", message: "Searching menu items...", delay: 1500 },
      { status: "analyzing", message: "Analyzing information...", delay: 2000 },
      { status: "generating_response", message: "Generating response...", delay: 1000 }
    ]

    let timeouts: NodeJS.Timeout[] = []
    let currentTime = 0

    statusSequence.forEach((statusItem, index) => {
      const timeout = setTimeout(() => {
        setIsAnimating(true)
        setCurrentStatus({
          ...statusItem,
          timestamp: new Date().toISOString()
        })
        
        // Reset animation after a brief moment
        setTimeout(() => setIsAnimating(false), 200)
      }, currentTime)
      
      timeouts.push(timeout)
      currentTime += statusItem.delay
    })

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [isVisible])

  if (!isVisible || !currentStatus) {
    return null
  }

  const config = STATUS_CONFIG[currentStatus.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.thinking
  const IconComponent = config.icon

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      <div className={`p-1.5 rounded-full ${config.bgColor} ${isAnimating ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
        <IconComponent 
          className={`h-3 w-3 ${config.color} ${config.icon === Loader2 ? 'animate-spin' : ''}`}
        />
      </div>
      <span className="text-gray-700">{currentStatus.message}</span>
      {currentStatus.detail && (
        <span className="text-gray-500 text-xs">({currentStatus.detail})</span>
      )}
      {currentStatus.progress && (
        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${currentStatus.progress}%` }}
          />
        </div>
      )}
      <div className="flex space-x-0.5">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  )
}

// Enhanced version that connects to real backend status stream
interface ChatStatusStreamProps {
  sessionId: string
  qrToken: string
  isVisible: boolean
  className?: string
  onStatusChange?: (status: StatusUpdate | null) => void
}

export function ChatStatusStream({ 
  sessionId, 
  qrToken, 
  isVisible, 
  className = "",
  onStatusChange 
}: ChatStatusStreamProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusUpdate | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  useEffect(() => {
    if (!isVisible || !sessionId) {
      setCurrentStatus(null)
      return
    }

    // Connect to status stream
    const url = `/api/v1/chat/public/${qrToken}/sessions/${sessionId}/status-stream`
    const es = new EventSource(url)
    
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.status === 'heartbeat') {
          return // Ignore heartbeat messages
        }
        
        setIsAnimating(true)
        setCurrentStatus(data)
        onStatusChange?.(data)
        
        // Reset animation
        setTimeout(() => setIsAnimating(false), 200)
        
      } catch (error) {
        console.error('Error parsing status event:', error)
      }
    }
    
    es.onerror = (error) => {
      console.error('Status stream error:', error)
      es.close()
    }
    
    setEventSource(es)

    return () => {
      es.close()
      setEventSource(null)
    }
  }, [isVisible, sessionId, qrToken, onStatusChange])

  if (!isVisible || !currentStatus) {
    return null
  }

  const config = STATUS_CONFIG[currentStatus.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.thinking
  const IconComponent = config.icon

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      <div className={`p-1.5 rounded-full ${config.bgColor} ${isAnimating ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
        <IconComponent 
          className={`h-3 w-3 ${config.color} ${config.icon === Loader2 ? 'animate-spin' : ''}`}
        />
      </div>
      <span className="text-gray-700">{currentStatus.message}</span>
      {currentStatus.detail && (
        <span className="text-gray-500 text-xs">({currentStatus.detail})</span>
      )}
      {currentStatus.progress && (
        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${currentStatus.progress}%` }}
          />
        </div>
      )}
      <div className="flex space-x-0.5">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  )
}
