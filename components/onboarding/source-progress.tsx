"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { apiClient, RestaurantSource } from "@/lib/api"

interface SourceProgressProps {
  sourceIds: string[]
  onAllComplete?: () => void
}

interface SourceState {
  id: string
  url: string
  category: string
  status: string
}

type TerminalStatus = "completed" | "failed"

const isTerminalStatus = (status: string): status is TerminalStatus => {
  return status === "completed" || status === "failed"
}

const truncateUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength - 3) + "..."
}

const getCategoryLabel = (category: string): string => {
  if (category === "menu") return "Menu"
  if (category === "context") return "General Info"
  return category
}

const getCategoryVariant = (category: string): "default" | "secondary" => {
  return category === "menu" ? "default" : "secondary"
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "completed") {
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }
  if (status === "failed") {
    return <XCircle className="h-4 w-4 text-red-500" />
  }
  // pending or processing
  return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
}

export function SourceProgress({ sourceIds, onAllComplete }: SourceProgressProps) {
  const [sources, setSources] = useState<Map<string, SourceState>>(new Map())
  const [loading, setLoading] = useState(true)
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const onAllCompleteRef = useRef(onAllComplete)
  const hasCalledOnComplete = useRef(false)

  // Keep the callback ref updated
  useEffect(() => {
    onAllCompleteRef.current = onAllComplete
  }, [onAllComplete])

  const fetchSource = useCallback(async (sourceId: string) => {
    try {
      const response = await apiClient.getSource(sourceId)
      if (response.data) {
        const source = response.data
        setSources(prev => {
          const newMap = new Map(prev)
          newMap.set(sourceId, {
            id: source.id,
            url: source.url || source.file_name || "Unknown source",
            category: source.source_category,
            status: source.status,
          })
          return newMap
        })

        // Stop polling for this source if it reached a terminal state
        if (isTerminalStatus(source.status)) {
          const intervalId = intervalRefs.current.get(sourceId)
          if (intervalId) {
            clearInterval(intervalId)
            intervalRefs.current.delete(sourceId)
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching source ${sourceId}:`, error)
    }
  }, [])

  // Initial fetch and setup polling
  useEffect(() => {
    if (sourceIds.length === 0) {
      setLoading(false)
      return
    }

    // Fetch all sources initially
    const fetchAll = async () => {
      await Promise.all(sourceIds.map(id => fetchSource(id)))
      setLoading(false)
    }
    fetchAll()

    // Set up polling for each source
    sourceIds.forEach(sourceId => {
      const intervalId = setInterval(() => {
        fetchSource(sourceId)
      }, 3000)
      intervalRefs.current.set(sourceId, intervalId)
    })

    // Cleanup all intervals on unmount
    return () => {
      intervalRefs.current.forEach(intervalId => {
        clearInterval(intervalId)
      })
      intervalRefs.current.clear()
    }
  }, [sourceIds, fetchSource])

  // Check if all sources have reached terminal state
  useEffect(() => {
    if (loading || sources.size === 0 || sources.size !== sourceIds.length) {
      return
    }

    const allTerminal = Array.from(sources.values()).every(source =>
      isTerminalStatus(source.status)
    )

    if (allTerminal && !hasCalledOnComplete.current) {
      hasCalledOnComplete.current = true
      // Clear any remaining intervals
      intervalRefs.current.forEach(intervalId => {
        clearInterval(intervalId)
      })
      intervalRefs.current.clear()

      onAllCompleteRef.current?.()
    }
  }, [sources, loading, sourceIds.length])

  if (loading && sources.size === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading sources...</span>
      </div>
    )
  }

  if (sourceIds.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {sourceIds.map(sourceId => {
        const source = sources.get(sourceId)
        if (!source) {
          return (
            <div key={sourceId} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          )
        }

        return (
          <div
            key={sourceId}
            className="flex items-center justify-between p-3 border rounded-lg bg-white"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <StatusIcon status={source.status} />
              <span className="text-sm text-gray-700 truncate" title={source.url}>
                {truncateUrl(source.url)}
              </span>
            </div>
            <Badge variant={getCategoryVariant(source.category)} className="ml-2 shrink-0">
              {getCategoryLabel(source.category)}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

export default SourceProgress
