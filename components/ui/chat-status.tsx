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

  // Show generic thinking status when visible but no specific status available
  useEffect(() => {
    if (!isVisible) {
      setCurrentStatus(null)
      return
    }

    // Show default thinking status
    setCurrentStatus({
      status: "thinking",
      message: "Processing your request...",
      timestamp: new Date().toISOString()
    })
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

// Enhanced version that updates based on external status updates
interface ChatStatusStreamProps {
  sessionId: string
  qrToken: string
  isVisible: boolean
  className?: string
  onStatusChange?: (status: StatusUpdate | null) => void
  currentStatus?: StatusUpdate | null
}

export function ChatStatusStream({ 
  sessionId, 
  qrToken, 
  isVisible, 
  className = "",
  onStatusChange,
  currentStatus: externalStatus
}: ChatStatusStreamProps) {
  const [currentStatus, setCurrentStatus] = useState<StatusUpdate | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Update internal status when external status changes
  useEffect(() => {
    if (externalStatus) {
      setIsAnimating(true)
      setCurrentStatus(externalStatus)
      onStatusChange?.(externalStatus)
      
      // Reset animation
      setTimeout(() => setIsAnimating(false), 200)
    } else if (!isVisible) {
      setCurrentStatus(null)
    } else {
      // Default status when visible but no specific status
      setCurrentStatus({
        status: "thinking",
        message: "Processing your request...",
        timestamp: new Date().toISOString()
      })
    }
  }, [externalStatus, isVisible, onStatusChange])

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
