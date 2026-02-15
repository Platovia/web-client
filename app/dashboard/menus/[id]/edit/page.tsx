"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { TagSelector } from "@/components/ui/tag-selector"
import { TagList } from "@/components/ui/tag-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Trash2, Plus, Edit, Eye, DollarSign, Loader2, CheckCircle, AlertTriangle, QrCode, Clock, Palette, LayoutTemplate, Link2, Upload, RefreshCw, FileText, XCircle, History, RotateCcw, Archive, Info } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ImageMatchingTabContent from "@/components/image-matching/image-matching-tab"
import { apiClient, type Menu, type MenuItem, type MenuUpdateRequest, type MenuItemCreateRequest, type MenuItemUpdateRequest, type Restaurant, type MenuTemplate, type DesignTemplateMetadata, type RestaurantSource, type CreateSourceRequest, type MenuVersion } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatPrice } from "@/lib/currency"
import { resolveImageUrl } from "@/lib/utils"

interface MenuWithItems {
  menu: Menu
  items: MenuItem[]
  restaurant?: Restaurant
}

export default function EditMenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id } = useParams<{ id: string }>()
  const fromUpload = searchParams.get('fromUpload') === 'true'
  
  const [menuData, setMenuData] = useState<MenuWithItems | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [addingItem, setAddingItem] = useState<string | null>(null) // category for which we're adding an item
  const [menuAnalytics, setMenuAnalytics] = useState({ 
    totalViews: 0, 
    uniqueViewers: 0, 
    qrScans: 0, 
    chatSessions: 0, 
    chatMessages: 0, 
    avgMessagesPerSession: 0.0 
  })
  const [success, setSuccess] = useState("")
  const [processing, setProcessing] = useState<{ status: string; progress: number; processed?: number; total?: number } | null>(null)
  const [awaitingItems, setAwaitingItems] = useState(false)
  const [error, setError] = useState("")
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [menuTemplates, setMenuTemplates] = useState<MenuTemplate[]>([])
  const [isPublishingTemplateId, setIsPublishingTemplateId] = useState<string | null>(null)
  const [designTemplates, setDesignTemplates] = useState<DesignTemplateMetadata[]>([])
  const [loadingDesignTemplates, setLoadingDesignTemplates] = useState(false)
  const [applyingDesignTemplateId, setApplyingDesignTemplateId] = useState<string | null>(null)
  const [itemSearch, setItemSearch] = useState("")
  // Sources tab state
  const [sources, setSources] = useState<RestaurantSource[]>([])
  const [loadingSources, setLoadingSources] = useState(false)
  const [processingSourceId, setProcessingSourceId] = useState<string | null>(null)
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null)
  const [addSourceDialogOpen, setAddSourceDialogOpen] = useState(false)
  const [addSourceUrl, setAddSourceUrl] = useState("")
  const [addSourceLabel, setAddSourceLabel] = useState("")

  const [addingSource, setAddingSource] = useState(false)
  const [uploadingSource, setUploadingSource] = useState(false)
  const [compilingSources, setCompilingSources] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastLoadedVersionIdRef = useRef<string | null>(null)
  // Version History tab state
  const [versions, setVersions] = useState<MenuVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [acceptingVersionId, setAcceptingVersionId] = useState<string | null>(null)
  const [discardingVersionId, setDiscardingVersionId] = useState<string | null>(null)
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null)
  const [editingVersionNameId, setEditingVersionNameId] = useState<string | null>(null)
  const [editingVersionName, setEditingVersionName] = useState("")
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null)
  const [previewItems, setPreviewItems] = useState<MenuItem[]>([])
  const [loadingPreviewItems, setLoadingPreviewItems] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("items")
  const [itemCategoryFilter, setItemCategoryFilter] = useState("All")
  const [itemAvailabilityFilter, setItemAvailabilityFilter] = useState<"All" | "Available" | "Unavailable">("All")
  const isUnavailable = (value: any) => {
    if (value === false || value === 0) return true
    if (typeof value === "string") {
      const lowered = value.toLowerCase()
      return lowered === "false" || lowered === "0"
    }
    return false
  }

  const draftCount = versions.filter(v => v.status === "draft").length
  const activeVersion = versions.find(v => v.status === "active") || null
  const selectedVersion = versions.find(v => v.id === selectedVersionId) || null
  const isVersionReadOnly = selectedVersion?.status === "archived"

  const refreshTemplates = useCallback(async () => {
    if (!id) return
    try {
      const templatesResponse = await apiClient.listMenuTemplates(id)
      if (templatesResponse.error) {
        setError("Failed to load template history: " + templatesResponse.error)
        return
      }
      setMenuTemplates(templatesResponse.data?.templates || [])
    } catch (err) {
      console.error("Unable to refresh template history:", err)
      setError("Failed to load template history")
    }
  }, [id])

  // Sources tab callbacks
  const loadSources = useCallback(async () => {
    if (!id) return
    setLoadingSources(true)
    try {
      const resp = await apiClient.getMenuSources(id)
      if (resp.error) {
        setError((prev) => prev || "Failed to load sources: " + resp.error)
        return
      }
      setSources(resp.data || [])
    } catch (err) {
      console.error("Error loading sources:", err)
    } finally {
      setLoadingSources(false)
    }
  }, [id])

  // Version History tab callbacks (defined early so source handlers can reference them)
  const loadVersions = useCallback(async () => {
    if (!id) return
    setLoadingVersions(true)
    try {
      const resp = await apiClient.getMenuVersions(id)
      if (resp.error) {
        setError((prev) => prev || "Failed to load versions: " + resp.error)
        return
      }
      // Sort by version number descending (newest first)
      const sortedVersions = (resp.data || []).sort((a, b) => b.version_number - a.version_number)
      setVersions(sortedVersions)
    } catch (err) {
      console.error("Error loading versions:", err)
    } finally {
      setLoadingVersions(false)
    }
  }, [id])

  useEffect(() => {
    if (!versions.length) return
    const stillExists = selectedVersionId && versions.some(v => v.id === selectedVersionId)
    if (stillExists) return
    const fallback = activeVersion ?? versions[0]
    setSelectedVersionId(fallback ? fallback.id : null)
  }, [versions, selectedVersionId, activeVersion])

  const handleProcessSource = useCallback(async (sourceId: string) => {
    setProcessingSourceId(sourceId)
    setError("")
    try {
      const resp = await apiClient.processSource(sourceId)
      if (resp.error) {
        setError("Failed to re-process source: " + resp.error)
        return
      }
      // Update status in local state
      setSources((prev) => prev.map((s) => s.id === sourceId ? { ...s, status: 'pending' } : s))
      setSuccess("Source queued for re-processing")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error processing source:", err)
      setError("Failed to re-process source")
    } finally {
      setProcessingSourceId(null)
    }
  }, [])

  const handleDeleteSource = useCallback(async (sourceId: string) => {
    setDeletingSourceId(sourceId)
    setError("")
    try {
      const resp = await apiClient.deleteSource(sourceId)
      if (resp.error) {
        setError("Failed to delete source: " + resp.error)
        return
      }
      // Remove from local state
      setSources((prev) => prev.filter((s) => s.id !== sourceId))
      setSuccess("Source deleted — menu will be recompiled from remaining sources")
      setTimeout(() => setSuccess(""), 3000)
      // Refresh draft and versions immediately
      await loadVersions()
      // Also refresh after a delay to catch async recompilation result
      setTimeout(async () => {
        await loadVersions()
      }, 5000)
    } catch (err) {
      console.error("Error deleting source:", err)
      setError("Failed to delete source")
    } finally {
      setDeletingSourceId(null)
    }
  }, [loadVersions])

  const handleAddSource = useCallback(async () => {
    if (!addSourceUrl.trim() || !menuData?.restaurant?.id) return
    setAddingSource(true)
    setError("")
    try {
      const data: CreateSourceRequest = {
        url: addSourceUrl.trim(),
        source_category: 'menu',
        menu_id: id,
        label: addSourceLabel.trim() || undefined,
      }
      const resp = await apiClient.createSource(menuData.restaurant.id, data)
      if (resp.error) {
        setError("Failed to add source: " + resp.error)
        return
      }
      // Add to local state
      if (resp.data) {
        setSources((prev) => [...prev, resp.data!])
      }
      // Dispatch processing
      if (resp.data?.id) {
        await apiClient.processSource(resp.data.id)
      }
      // Refresh sources to get updated status from server
      await loadSources()
      setAddSourceDialogOpen(false)
      setAddSourceUrl("")
      setAddSourceLabel("")
      setSuccess("Source added and queued for processing — menu will be recompiled")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error adding source:", err)
      setError("Failed to add source")
    } finally {
      setAddingSource(false)
    }
  }, [id, addSourceUrl, addSourceLabel, menuData?.restaurant?.id, loadSources])

  const handleUploadSourceFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !menuData?.restaurant?.id) return
    setUploadingSource(true)
    setError("")
    try {
      const resp = await apiClient.uploadSourceDocument(menuData.restaurant.id, file, {
        source_category: 'menu',
        menu_id: id,
      })
      if (resp.error) {
        setError("Failed to upload document: " + resp.error)
        return
      }
      // Dispatch processing for the uploaded document
      if (resp.data?.id) {
        await apiClient.processSource(resp.data.id)
      }
      // Refresh sources list
      await loadSources()
      setSuccess("Document uploaded and queued for processing — menu will be recompiled")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error uploading document:", err)
      setError("Failed to upload document")
    } finally {
      setUploadingSource(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [id, menuData?.restaurant?.id, loadSources])

  const handleCompileSources = useCallback(async () => {
    if (!id) return
    setCompilingSources(true)
    setError("")
    try {
      const resp = await apiClient.compileSources(id)
      if (resp.error) {
        setError("Failed to recompile: " + resp.error)
        return
      }
      setSuccess("Recompilation started — a new draft will be created")
      setTimeout(() => setSuccess(""), 3000)
      // Refresh after delays to catch Celery task completion
      setTimeout(async () => {
        await loadVersions()
      }, 5000)
      setTimeout(async () => {
        await loadVersions()
      }, 15000)
    } catch (err) {
      console.error("Error compiling sources:", err)
      setError("Failed to recompile menu from sources")
    } finally {
      setCompilingSources(false)
    }
  }, [id, loadVersions])

  const handleAcceptVersion = useCallback(async (versionId: string) => {
    if (!id) return
    setAcceptingVersionId(versionId)
    setError("")
    try {
      const resp = await apiClient.acceptVersion(id, versionId)
      if (resp.error) {
        setError("Failed to accept draft: " + resp.error)
        return
      }
      setSuccess("Draft accepted and set as active version")
      setTimeout(() => setSuccess(""), 3000)
      setSelectedVersionId(versionId)
      await loadVersions()
    } catch (err) {
      console.error("Error accepting draft:", err)
      setError("Failed to accept draft")
    } finally {
      setAcceptingVersionId(null)
    }
  }, [id, loadVersions])

  const handleDiscardVersion = useCallback(async (versionId: string) => {
    if (!id) return
    setDiscardingVersionId(versionId)
    setError("")
    try {
      const resp = await apiClient.discardVersion(id, versionId)
      if (resp.error) {
        setError("Failed to discard draft: " + resp.error)
        return
      }
      setSuccess("Draft discarded")
      setTimeout(() => setSuccess(""), 3000)
      await loadVersions()
    } catch (err) {
      console.error("Error discarding draft:", err)
      setError("Failed to discard draft")
    } finally {
      setDiscardingVersionId(null)
    }
  }, [id, loadVersions])

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    if (!id) return
    setRestoringVersionId(versionId)
    setError("")
    try {
      const resp = await apiClient.restoreVersion(id, versionId)
      if (resp.error) {
        setError("Failed to restore version: " + resp.error)
        return
      }
      setSuccess("Version restored as active")
      setTimeout(() => setSuccess(""), 3000)
      setSelectedVersionId(versionId)
      await loadVersions()
    } catch (err) {
      console.error("Error restoring version:", err)
      setError("Failed to restore version")
    } finally {
      setRestoringVersionId(null)
    }
  }, [id, loadVersions])

  const handlePreviewVersionItems = useCallback(async (versionId: string) => {
    if (!id) return
    setPreviewVersionId(versionId)
    setLoadingPreviewItems(true)
    setPreviewItems([])
    try {
      const resp = await apiClient.getVersionItems(id, versionId)
      if (resp.error) {
        setError("Failed to load version items: " + resp.error)
        setPreviewVersionId(null)
        return
      }
      setPreviewItems(resp.data || [])
    } catch (err) {
      console.error("Error loading version items:", err)
      setError("Failed to load version items")
      setPreviewVersionId(null)
    } finally {
      setLoadingPreviewItems(false)
    }
  }, [id])

  const handleSaveVersionName = useCallback(async (versionId: string) => {
    if (!id) return
    try {
      const resp = await apiClient.updateVersion(id, versionId, { name: editingVersionName.trim() || undefined })
      if (resp.error) {
        setError("Failed to update version name: " + resp.error)
        return
      }
      setVersions(prev => prev.map(v => v.id === versionId ? { ...v, name: editingVersionName.trim() || undefined } : v))
    } catch (err) {
      console.error("Error updating version name:", err)
      setError("Failed to update version name")
    } finally {
      setEditingVersionNameId(null)
      setEditingVersionName("")
    }
  }, [id, editingVersionName])

  const loadDesignTemplates = useCallback(async () => {
    if (!menuData?.restaurant?.company_id) return
    setLoadingDesignTemplates(true)
    try {
      const resp = await apiClient.listDesignTemplates(menuData.restaurant.company_id)
      if (resp.error) {
        setError((prev) => prev || "Failed to load design templates: " + resp.error)
        return
      }
      setDesignTemplates(resp.data?.templates || [])
    } finally {
      setLoadingDesignTemplates(false)
    }
  }, [menuData?.restaurant?.company_id])

  const loadMenuData = useCallback(async () => {
    if (!id) return
    
    setIsLoading(true)
    setError("")

    try {
      // Load menu details
      const menuResponse = await apiClient.getMenu(id)
      if (menuResponse.error) {
        setError("Failed to load menu: " + menuResponse.error)
        return
      }

      // Check processing status first to guard UI during processing
      let latestJobStatus: string | null = null
      try {
        const latestJob = await apiClient.getLatestOCRJobForMenu(id)
        if (latestJob.data) {
          latestJobStatus = latestJob.data.status
        }
        if (latestJob.data && (latestJob.data.status === 'processing' || latestJob.data.status === 'pending')) {
          setProcessing({
            status: latestJob.data.status,
            progress: Math.round(latestJob.data.progress_percentage || 0),
            processed: latestJob.data.processed_images || 0,
            total: latestJob.data.total_images || 0,
          })
        } else {
          setProcessing(null)
        }
      } catch {
        setProcessing(null)
      }

      // Load menu items
      const itemsResponse = await apiClient.getMenuItems(id)
      if (itemsResponse.error) {
        setError("Failed to load menu items: " + itemsResponse.error)
        return
      }

      // Load restaurant info
      const restaurantResponse = await apiClient.getRestaurant(menuResponse.data!.restaurant_id)

      setMenuData({
        menu: menuResponse.data!,
        items: itemsResponse.data?.items || [],
        restaurant: restaurantResponse.data || undefined
      })
      await refreshTemplates()

      // Load analytics for this menu
      try {
        const [analyticsResponse, chatResponse] = await Promise.all([
          apiClient.getMenuAnalytics(id),
          apiClient.getChatAnalytics(id)
        ])
        
        if (analyticsResponse.data?.data) {
          const chatData = chatResponse.data?.data || {}
          setMenuAnalytics({
            totalViews: analyticsResponse.data.data.total_views,
            uniqueViewers: analyticsResponse.data.data.unique_viewers,
            qrScans: analyticsResponse.data.data.qr_scans,
            chatSessions: chatData.total_sessions || 0,
            chatMessages: chatData.total_messages || 0,
            avgMessagesPerSession: chatData.avg_messages_per_session || 0.0
          })
        }
      } catch (analyticsError) {
        console.error("Error loading menu analytics:", analyticsError)
      }

      if (fromUpload) {
        const itemCount = itemsResponse.data?.items?.length || 0
        if (latestJobStatus === "completed" && itemCount > 0) {
          setAwaitingItems(false)
          setSuccess("Menu uploaded successfully! Review and edit the extracted items below.")
        } else if (latestJobStatus === "completed" && itemCount === 0) {
          setAwaitingItems(true)
          setSuccess("")
        } else {
          setAwaitingItems(false)
          setSuccess("")
        }
      }
    } catch (err) {
      console.error("Error loading menu data:", err)
      setError("Failed to load menu data")
    } finally {
      setIsLoading(false)
    }
  }, [id, fromUpload, refreshTemplates])

  const loadMenuItemsForVersion = useCallback(async (versionId: string | null) => {
    if (!id) return
    try {
      const itemsResp = await apiClient.getMenuItems(id, versionId || undefined)
      if (itemsResp.error) {
        setError((prev) => prev || "Failed to load menu items: " + itemsResp.error)
        return
      }
      setMenuData((prev) => prev ? { ...prev, items: itemsResp.data?.items || [] } : prev)
      lastLoadedVersionIdRef.current = versionId || null
    } catch (err) {
      console.error("Error loading menu items:", err)
      setError("Failed to load menu items")
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadMenuData()
    }
  }, [id, loadMenuData])

  useEffect(() => {
    if (!id || !menuData || !selectedVersionId) return
    if (lastLoadedVersionIdRef.current === selectedVersionId) return
    loadMenuItemsForVersion(selectedVersionId)
  }, [id, menuData, selectedVersionId, loadMenuItemsForVersion])

  // Load sources for the Sources tab
  useEffect(() => {
    if (id) {
      loadSources()
    }
  }, [id, loadSources])

  // Load versions for the Version History tab
  useEffect(() => {
    if (id) {
      loadVersions()
    }
  }, [id, loadVersions])

  // Unified polling: handles both OCR processing and awaiting-items states
  useEffect(() => {
    if (!id) return

    const shouldPoll =
      (processing && (processing.status === "processing" || processing.status === "pending")) ||
      (fromUpload && awaitingItems)

    if (!shouldPoll) return

    let isActive = true

    const interval = setInterval(async () => {
      try {
        const latest = await apiClient.getLatestOCRJobForMenu(id)
        if (!isActive || !latest.data) return

        const job = latest.data

        if (job.status === "processing" || job.status === "pending") {
          setProcessing({
            status: job.status,
            progress: Math.round(job.progress_percentage || 0),
            processed: job.processed_images || 0,
            total: job.total_images || 0,
          })
          setAwaitingItems(false)
        } else if (job.status === "failed") {
          setProcessing(null)
          setAwaitingItems(false)
          setError("AI processing failed. Please retry the upload or check the job logs.")
          clearInterval(interval)
        } else {
          // Completed — refresh items
          try {
            const itemsResponse = await apiClient.getMenuItems(id, selectedVersionId || undefined)
            if (isActive && itemsResponse.data) {
              const newItems = itemsResponse.data.items || []
              setMenuData((prev) => prev ? { ...prev, items: newItems } : prev)
              setProcessing(null)
              if (fromUpload) {
                if (newItems.length > 0) {
                  setAwaitingItems(false)
                  setSuccess("Menu uploaded successfully! Review and edit the extracted items below.")
                  clearInterval(interval)
                } else {
                  setAwaitingItems(true)
                }
              } else {
                clearInterval(interval)
              }
            }
          } catch {
            // Ignore item refresh errors during polling
          }
        }
      } catch {
        // Ignore transient errors; continue polling
      }
    }, 5000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [id, processing?.status, fromUpload, awaitingItems])

  // Poll sources when any are pending/processing
  const pendingSourceCount = sources.filter(
    (s) => s.status === "pending" || s.status === "processing"
  ).length

  const prevPendingCountRef = useRef(pendingSourceCount)

  useEffect(() => {
    if (!pendingSourceCount || !id) return

    const interval = setInterval(async () => {
      try {
        const resp = await apiClient.getMenuSources(id)
        if (resp.data) {
          setSources(resp.data)
        }
      } catch {
        // Ignore transient errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id, pendingSourceCount, selectedVersionId, fromUpload, awaitingItems, processing])

  // When all sources finish processing, refresh draft and versions
  useEffect(() => {
    if (prevPendingCountRef.current > 0 && pendingSourceCount === 0 && id) {
      // Sources just finished processing — check for new draft
      loadVersions()
    }
    prevPendingCountRef.current = pendingSourceCount
  }, [pendingSourceCount, id, loadVersions])

  useEffect(() => {
    void loadDesignTemplates()
  }, [loadDesignTemplates])

  const handleActivateTemplate = useCallback(async (templateId: string) => {
    if (!id) return
    setIsPublishingTemplateId(templateId)
    setError("")
    try {
      const response = await apiClient.publishMenuTemplate(id, templateId, true)
      if (response.error) {
        setError("Failed to activate template: " + response.error)
        return
      }
      setSuccess("Template activated")
      setTimeout(() => setSuccess(""), 3000)
      await refreshTemplates()
    } finally {
      setIsPublishingTemplateId(null)
    }
  }, [id, refreshTemplates])

  const handleApplyDesignTemplate = useCallback(async (templateId: string, templateName: string) => {
    if (!id) return
    setApplyingDesignTemplateId(templateId)
    setError("")
    try {
      const templateResp = await apiClient.getDesignTemplate(templateId)
      if (templateResp.error || !templateResp.data) {
        setError("Failed to load design template: " + (templateResp.error || "Not found"))
        return
      }

      const layoutPayload = templateResp.data.preset_layout
      const created = await apiClient.createMenuTemplate(id, {
        name: templateName,
        definition_id: templateResp.data.id,
        layout_config: layoutPayload,
        theme_config: templateResp.data.default_theme,
      })
      if (created.error || !created.data?.id) {
        setError("Failed to create design version: " + (created.error || "Missing template id"))
        return
      }

      const published = await apiClient.publishMenuTemplate(id, created.data.id, true)
      if (published.error) {
        setError("Failed to activate design: " + published.error)
        return
      }

      setSuccess(`${templateName} applied and set active`)
      setTimeout(() => setSuccess(""), 3000)
      await refreshTemplates()
      setMenuData((prev) => prev ? ({
        ...prev,
        menu: { ...prev.menu, theme_config: templateResp.data.default_theme ?? prev.menu.theme_config }
      }) : prev)
    } finally {
      setApplyingDesignTemplateId(null)
    }
  }, [id, refreshTemplates])

  // Load/refresh active QR token for Preview
  useEffect(() => {
    const fetchToken = async () => {
      if (!id) return
      try {
        const qr = await apiClient.getQRCodeInfo(id)
        if (qr.data?.token) {
          setActiveToken(qr.data.token)
        } else {
          setActiveToken(null)
        }
      } catch {
        setActiveToken(null)
      }
    }
    fetchToken()
  }, [id])

  const categories = menuData ? Array.from(new Set(menuData.items.map((item) => item.category || "Other").filter(Boolean))) : []
  const filteredItems = menuData
    ? menuData.items.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(itemSearch.toLowerCase())
        const matchesCategory =
          itemCategoryFilter === "All" ||
          (item.category || "Other") === itemCategoryFilter
        const matchesAvailability =
          itemAvailabilityFilter === "All" ||
          (itemAvailabilityFilter === "Available" ? !isUnavailable(item.is_available) : isUnavailable(item.is_available))
        return matchesSearch && matchesCategory && matchesAvailability
      })
    : []
  const filteredCategories = Array.from(
    new Set(
      filteredItems.map((item) => item.category || "Other").filter(Boolean)
    )
  )

  const handleSaveMenu = async () => {
    if (!menuData) return
    
    setIsSaving(true)
    setError("")

    try {
      const updateData: MenuUpdateRequest = {
        name: menuData.menu.name,
        is_active: menuData.menu.is_active
      }

      const response = await apiClient.updateMenu(id, updateData)
      if (response.error) {
        setError("Failed to save menu: " + response.error)
      } else {
        setSuccess("Menu updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      console.error("Error saving menu:", err)
      setError("Failed to save menu")
    } finally {
      setIsSaving(false)
    }
  }

  const handleActivateMenu = async () => {
    if (!menuData || menuData.menu.is_active) return
    
    setIsActivating(true)
    setError("")

    try {
      const response = await apiClient.activateMenu(id)
      if (response.error) {
        setError("Failed to activate menu: " + response.error)
      } else {
        // Update local state
        setMenuData(prev => prev ? {
          ...prev,
          menu: { ...prev.menu, is_active: true }
        } : prev)
        setSuccess("Menu activated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      console.error("Error activating menu:", err)
      setError("Failed to activate menu")
    } finally {
      setIsActivating(false)
    }
  }

  const handleDeleteMenu = async () => {
    if (!menuData) return

    const confirmMessage = `Are you sure you want to delete "${menuData.menu.name}"? This action cannot be undone and will permanently delete all menu items, images, and related data.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await apiClient.deleteMenu(id)
      if (response.error) {
        setError("Failed to delete menu: " + response.error)
      } else {
        setSuccess("Menu deleted successfully! Redirecting...")
        setTimeout(() => {
          router.push("/dashboard/menus")
        }, 2000)
      }
    } catch (err) {
      console.error("Error deleting menu:", err)
      setError("Failed to delete menu")
    }
  }

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    if (!menuData) return

    try {
      const updateData: MenuItemUpdateRequest = {
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        category: updatedItem.category,
        allergens: updatedItem.allergens,
        tags: updatedItem.tags,
        is_available: updatedItem.is_available,
        image_url: updatedItem.image_url
      }

      const response = await apiClient.updateMenuItem(id, updatedItem.id, updateData)
      if (response.error) {
        setError("Failed to update item: " + response.error)
      } else {
        // Update local state
        setMenuData(prev => prev ? {
          ...prev,
          items: prev.items.map(item => item.id === updatedItem.id ? response.data! : item)
        } : prev)
        setEditingItem(null)
        setSuccess("Item updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      console.error("Error updating item:", err)
      setError("Failed to update item")
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return
    }

    if (!menuData) return

    try {
      const response = await apiClient.deleteMenuItem(id, itemId)
      if (response.error) {
        setError("Failed to delete item: " + response.error)
      } else {
        // Update local state
        setMenuData(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId)
        } : prev)
        setSuccess("Item deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      console.error("Error deleting item:", err)
      setError("Failed to delete item")
    }
  }

  const toggleItemAvailability = async (itemId: string) => {
    if (!menuData) return

    const item = menuData.items.find(i => i.id === itemId)
    if (!item) return

    try {
      const updateData: MenuItemUpdateRequest = {
        is_available: !item.is_available
      }

      const response = await apiClient.updateMenuItem(id, itemId, updateData)
      if (response.error) {
        setError("Failed to update item availability: " + response.error)
      } else {
        // Update local state
        setMenuData(prev => prev ? {
          ...prev,
          items: prev.items.map(item => item.id === itemId ? response.data! : item)
        } : prev)
      }
    } catch (err) {
      console.error("Error updating item availability:", err)
      setError("Failed to update item availability")
    }
  }

  const handleAddItem = async (itemData: MenuItemCreateRequest) => {
    if (!menuData) return

    try {
      const response = await apiClient.createMenuItem(id, {
        ...itemData,
        version_id: selectedVersionId || undefined,
      })
      if (response.error) {
        setError("Failed to add item: " + response.error)
      } else {
        // Update local state
        setMenuData(prev => prev ? {
          ...prev,
          items: [...prev.items, response.data!]
        } : prev)
        setAddingItem(null) // Close the add item modal
        setSuccess("Item added successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (err) {
      console.error("Error adding item:", err)
      setError("Failed to add item")
    }
  }

  const handleSubmitNewItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!addingItem) return

    const formData = new FormData(e.currentTarget)
    const itemData: MenuItemCreateRequest = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string) || 0,
      category: addingItem,
      allergens: (formData.get('allergens') as string)
        .split(',')
        .map(a => a.trim())
        .filter(a => a),
      is_available: true,
    }

    handleAddItem(itemData)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading menu...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!menuData) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || "Menu not found"}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  const isMenuLocked = Boolean(processing) || awaitingItems
  const isItemsLocked = isMenuLocked || Boolean(isVersionReadOnly)

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/menus">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menus
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Menu</h1>
              <p className="text-gray-600">
                {menuData.menu.name} - {menuData.restaurant ? (
                  <Link 
                    href={`/dashboard/restaurants/${menuData.restaurant.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {menuData.restaurant.name}
                  </Link>
                ) : (
                  "Unknown Restaurant"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {processing && (
              <div className="px-3 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-2 mr-4">
                <Clock className="h-4 w-4" />
                AI processing {processing.processed || 0}/{processing.total || 0} pages... {processing.progress}%
              </div>
            )}
            {awaitingItems && !processing && (
              <div className="px-3 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-2 mr-4">
                <Clock className="h-4 w-4" />
                Finalizing extracted items... This can take a moment.
              </div>
            )}
            {!menuData.menu.is_active && (
              <Button onClick={handleActivateMenu} disabled={isActivating} variant="default" className="bg-green-600 hover:bg-green-700">
                {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Set as Active
              </Button>
            )}
            <Link href={`/dashboard/menus/${id}/qr`}>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </Link>
            <Link href={activeToken ? `/menu/${menuData.restaurant?.id}?token=${activeToken}` : `/dashboard/menus/${id}/qr`} target={activeToken ? "_blank" : "_self"}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {activeToken ? "Preview" : "Generate QR"}
              </Button>
            </Link>
            <Button onClick={handleSaveMenu} disabled={isSaving || isMenuLocked}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button onClick={handleDeleteMenu} variant="destructive" disabled={isMenuLocked}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Menu
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Draft banner - visible across all tabs */}
        {draftCount > 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 flex items-center justify-between flex-wrap gap-4">
              <span>
                You have {draftCount} draft version{draftCount > 1 ? 's' : ''} ready for review.
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setActiveTab("versions")}
                >
                  Review Drafts
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(tab) => {
          setActiveTab(tab)
          if (tab === "versions") {
            loadVersions()
          }
        }} className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="image-matching">Image Matching</TabsTrigger>
            <TabsTrigger value="settings">Menu Settings</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {(processing || awaitingItems) && (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This menu is currently processing. Editing is temporarily disabled. Please check back shortly.
                </AlertDescription>
              </Alert>
            )}
            {versions.length > 0 && (
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-64">
                  <Label htmlFor="version-select">Menu Version</Label>
                  <Select value={selectedVersionId || ""} onValueChange={setSelectedVersionId}>
                    <SelectTrigger id="version-select">
                      <SelectValue placeholder="Select a version" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          v{version.version_number}{version.name ? ` · ${version.name}` : ''} · {version.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedVersion && (
                  <Badge variant="outline" className="capitalize">
                    {selectedVersion.status}
                  </Badge>
                )}
                {isVersionReadOnly && (
                  <Badge variant="secondary">Read-only</Badge>
                )}
              </div>
            )}
            {isVersionReadOnly && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This version is archived and read-only. Editing is disabled.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="item-search">Search items</Label>
                <Input
                  id="item-search"
                  placeholder="Search by name or description"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="item-category">Filter by category</Label>
                <select
                  id="item-category"
                  className="w-full p-2 border rounded-md"
                  value={itemCategoryFilter}
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="item-availability">Availability</Label>
                <select
                  id="item-availability"
                  className="w-full p-2 border rounded-md"
                  value={itemAvailabilityFilter}
                  onChange={(e) => setItemAvailabilityFilter(e.target.value as typeof itemAvailabilityFilter)}
                >
                  <option value="All">All</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>
            {filteredItems.length === 0 && (
              <Alert className="border border-dashed">
                <AlertDescription>No items match your search/filter.</AlertDescription>
              </Alert>
            )}
            {/* Menu Items by Category */}
            {filteredCategories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category}</CardTitle>
                    <Button size="sm" onClick={() => setAddingItem(category)} disabled={isItemsLocked}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                        {filteredItems
                          .filter((item) => (item.category || "Other") === category)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          {/* Item Image */}
                          {item.image_url && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                              <img 
                                src={resolveImageUrl(item.image_url) || "/placeholder.jpg"} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-600">
                                  {formatPrice(item.price, menuData.restaurant?.currency_code)}
                                </Badge>
                                {!item.is_available && <Badge variant="destructive">Unavailable</Badge>}
                                {/* Display tags if available, otherwise fall back to legacy fields */}
                                {item.tags && item.tags.length > 0 ? (
                                  <TagList tags={item.tags} size="sm" maxTags={3} />
                                ) : (
                                  <>
                                    {item.is_vegetarian && (
                                      <Badge variant="outline" className="text-green-600">
                                        Vegetarian
                                      </Badge>
                                    )}
                                    {item.is_vegan && (
                                      <Badge variant="outline" className="text-green-700">
                                        Vegan
                                      </Badge>
                                    )}
                                    {item.is_gluten_free && (
                                      <Badge variant="outline" className="text-blue-600">
                                        Gluten Free
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            {item.allergens && item.allergens.length > 0 && (
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-gray-500">Allergens: {item.allergens.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant={item.is_available ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleItemAvailability(item.id)}
                              disabled={isItemsLocked}
                            >
                              {item.is_available ? "Available" : "Unavailable"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingItem(item)} disabled={isItemsLocked}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)} disabled={isItemsLocked}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Menu Settings</CardTitle>
                <CardDescription>Configure your menu details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="menuName">Menu Name</Label>
                    <Input
                      id="menuName"
                      value={menuData.menu.name}
                      onChange={(e) => setMenuData((prev) => prev ? ({
                        ...prev,
                        menu: { ...prev.menu, name: e.target.value }
                      }) : prev)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={menuData.menu.is_active ? "active" : "inactive"}
                      onChange={(e) => setMenuData((prev) => prev ? ({
                        ...prev,
                        menu: { ...prev.menu, is_active: e.target.value === "active" }
                      }) : prev)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={menuData.restaurant?.description || ""}
                    onChange={(e) => setMenuData((prev) => prev ? ({
                      ...prev,
                      restaurant: prev.restaurant ? { ...prev.restaurant, description: e.target.value } : undefined
                    }) : prev)}
                    rows={3}
                    placeholder="Menu description (controlled by restaurant settings)"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image-matching">
            <div className="space-y-4">
              {versions.length > 0 && (
                <div className="flex flex-wrap items-end gap-4">
                  <div className="w-64">
                    <Label htmlFor="version-select-images">Menu Version</Label>
                    <Select value={selectedVersionId || ""} onValueChange={setSelectedVersionId}>
                      <SelectTrigger id="version-select-images">
                        <SelectValue placeholder="Select a version" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            v{version.version_number} · {version.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedVersion && (
                    <Badge variant="outline" className="capitalize">
                      {selectedVersion.status}
                    </Badge>
                  )}
                  {isVersionReadOnly && (
                    <Badge variant="secondary">Read-only</Badge>
                  )}
                </div>
              )}
              <ImageMatchingTabContent
                menuId={id}
                versionId={selectedVersionId}
                readOnly={Boolean(isVersionReadOnly)}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Menu Analytics</CardTitle>
                <CardDescription>Performance metrics for this menu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{menuAnalytics.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Views</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{menuAnalytics.uniqueViewers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Unique Viewers</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{menuAnalytics.qrScans.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">QR Scans</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{menuAnalytics.chatSessions.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Chat Sessions</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <p className="text-2xl font-bold text-teal-600">{menuAnalytics.chatMessages.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Chat Messages</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{menuAnalytics.avgMessagesPerSession.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Messages/Session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Template History</CardTitle>
              <CardDescription>Saved layout versions you can re-activate for this menu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {menuTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved templates yet.</p>
              ) : (
                menuTemplates.map((template) => (
                  <div key={template.id} className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(template.created_at).toLocaleString()}
                      </p>
                      {template.definition_key && (
                        <p className="text-xs text-muted-foreground">Source: {template.definition_key}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="flex flex-wrap items-center gap-2">
                        {template.is_active && <Badge variant="secondary">Active</Badge>}
                        {template.is_draft && <Badge variant="outline">Draft</Badge>}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivateTemplate(template.id)}
                        disabled={template.is_active || isPublishingTemplateId === template.id}
                      >
                        {isPublishingTemplateId === template.id
                          ? "Activating..."
                          : template.is_active
                            ? "Active"
                            : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Menu Design</CardTitle>
                <CardDescription>Choose a template and customize theme. Advanced users can switch to the visual builder.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Template</Label>
                    <select
                      value={menuData.menu.template_id}
                      onChange={(e) => {
                        const templateKey = e.target.value
                        setMenuData(prev => prev ? ({ ...prev, menu: { ...prev.menu, template_id: templateKey } }) : prev)
                        // Do not save automatically; wait for Save Design
                      }}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="default">Default</option>
                      <option value="hero-grid">Hero Grid</option>
                      <option value="compact-list">Compact List</option>
                    </select>
                  </div>
                  <div>
                    <Label>Primary Color</Label>
                    <input
                      type="color"
                      className="w-16 h-10 border rounded"
                      value={(menuData.menu as any)?.theme_config?.colors?.primary || "#ff6600"}
                      onChange={(e) => setMenuData(prev => prev ? ({
                        ...prev,
                        menu: {
                          ...prev.menu,
                          theme_config: { ...((prev.menu as any).theme_config || {}), colors: { ...(((prev.menu as any).theme_config?.colors) || {}), primary: e.target.value } }
                        }
                      }) : prev)}
                      onBlur={async (e) => {
                        const primary = e.currentTarget.value
                        await apiClient.updateMenu(id, { theme_config: { ...((menuData.menu as any).theme_config || {}), colors: { ...(((menuData.menu as any).theme_config?.colors) || {}), primary } } })
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/menus/${id}/design`}>
                    <Button variant="outline"><LayoutTemplate className="h-4 w-4 mr-2" /> Open Visual Builder</Button>
                  </Link>
                  <Button onClick={async () => {
                    if (!menuData) return
                    setIsSaving(true)
                    // Persist chosen default template by upserting the menu_templates row for that definition
                    if (menuData.menu.template_id) {
                      const templateKey = menuData.menu.template_id
                      // Map key -> definition_id to match backend expectations
                      const defsResp = await apiClient.listTemplateDefinitions()
                      const def = defsResp.data?.definitions?.find(d => d.key === templateKey)
                      const payload = def ? { name: def.name, definition_id: def.id } : { name: templateKey, definition_key: templateKey }
                      const created = await apiClient.createMenuTemplate(id, payload as any)
                      if (created.data?.id) await apiClient.publishMenuTemplate(id, created.data.id, true)
                    }
                    const resp = await apiClient.updateMenu(id, { template_id: menuData.menu.template_id, theme_config: (menuData.menu as any).theme_config })
                    setIsSaving(false)
                    if (resp.error) setError(resp.error); else setSuccess("Design saved")
                  }}>Save Design</Button>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">Saved designs</p>
                      <p className="text-sm text-muted-foreground">Apply visual builder designs without leaving this page.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadDesignTemplates}
                      disabled={loadingDesignTemplates}
                    >
                      {loadingDesignTemplates ? "Refreshing..." : "Refresh"}
                    </Button>
                  </div>
                  {loadingDesignTemplates ? (
                    <p className="text-sm text-muted-foreground">Loading designs…</p>
                  ) : designTemplates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved designs yet.</p>
                  ) : (
                    designTemplates.map((template) => (
                      <div key={template.id} className="flex flex-col gap-2 rounded-md border bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplyDesignTemplate(template.id, template.name)}
                            disabled={applyingDesignTemplateId === template.id}
                          >
                            {applyingDesignTemplateId === template.id ? "Applying..." : "Set Active"}
                          </Button>
                          <Link href={`/dashboard/menus/${id}/design`}>
                            <Button size="sm" variant="ghost">
                              <LayoutTemplate className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5" />
                      Menu Sources
                    </CardTitle>
                    <CardDescription>
                      URLs and documents used to extract menu items
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={addSourceDialogOpen} onOpenChange={setAddSourceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add URL
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add URL Source</DialogTitle>
                          <DialogDescription>
                            Add a URL to extract menu items from
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="source-url">URL (required)</Label>
                            <Input
                              id="source-url"
                              placeholder="https://example.com/menu"
                              value={addSourceUrl}
                              onChange={(e) => setAddSourceUrl(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="source-label">Label (optional)</Label>
                            <Input
                              id="source-label"
                              placeholder="Main menu page"
                              value={addSourceLabel}
                              onChange={(e) => setAddSourceLabel(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setAddSourceDialogOpen(false)}
                            disabled={addingSource}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddSource}
                            disabled={addingSource || !addSourceUrl.trim()}
                          >
                            {addingSource && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Add Source
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingSource}
                    >
                      {uploadingSource ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Document
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleUploadSourceFile}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCompileSources}
                      disabled={compilingSources || sources.filter(s => s.status === 'completed').length === 0}
                    >
                      {compilingSources ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Recompile
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={loadSources}
                      disabled={loadingSources}
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingSources ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSources ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading sources...</span>
                  </div>
                ) : sources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sources added yet</p>
                    <p className="text-sm">Add a URL or upload a document to extract menu items</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sources.map((source) => (
                      <Card key={source.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {source.source_type === 'url' ? (
                                  <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                                <span className="font-medium truncate">
                                  {source.url || source.file_name || 'Unknown source'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant={
                                    source.status === 'completed' ? 'default' :
                                    source.status === 'failed' ? 'destructive' :
                                    source.status === 'processing' ? 'secondary' :
                                    'outline'
                                  }
                                  className={
                                    source.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                    source.status === 'failed' ? '' :
                                    source.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }
                                >
                                  {source.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {source.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                  {(source.status === 'pending' || source.status === 'processing') && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                  {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                                </Badge>
                                {source.label && (
                                  <Badge variant="outline">{source.label}</Badge>
                                )}
                                {source.items_extracted !== undefined && source.items_extracted > 0 && (
                                  <span className="text-sm text-muted-foreground">
                                    {source.items_extracted} items extracted
                                  </span>
                                )}
                                {source.last_processed_at && (
                                  <span className="text-sm text-muted-foreground">
                                    Processed: {new Date(source.last_processed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {source.error_message && (
                                <p className="text-sm text-destructive mt-2">
                                  {/poppler|traceback|errno|exception|in PATH/i.test(source.error_message)
                                    ? "Source processing failed. Please try again or use a different format."
                                    : source.error_message}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProcessSource(source.id)}
                                disabled={processingSourceId === source.id || source.status === 'processing' || source.status === 'pending'}
                              >
                                {processingSourceId === source.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                                <span className="ml-2 hidden sm:inline">Re-process</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    disabled={deletingSourceId === source.id}
                                  >
                                    {deletingSourceId === source.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Source</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this source? The menu will be recompiled from the remaining sources.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSource(source.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {menuData?.restaurant?.id && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  These sources apply to this menu only. To manage restaurant-wide context sources (hours, location, policies, etc.), go to the{" "}
                  <Link href={`/dashboard/restaurants/${menuData.restaurant.id}?tab=context`} className="text-primary underline underline-offset-4 hover:text-primary/80">
                    restaurant Context tab
                  </Link>.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Version History
                    </CardTitle>
                    <CardDescription>
                      View and manage menu versions. Accept drafts or restore previous versions.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={loadVersions}
                    disabled={loadingVersions}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingVersions ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingVersions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading versions...</span>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No versions yet</p>
                    <p className="text-sm">Menu versions are created when sources are processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Draft version card - displayed prominently at top */}
                    {versions.filter(v => v.status === 'draft').map((version) => (
                      <Card key={version.id} className="border-2 border-amber-300 bg-amber-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-lg">v{version.version_number}</span>
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                                  Draft
                                </Badge>
                                {editingVersionNameId === version.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      value={editingVersionName}
                                      onChange={(e) => setEditingVersionName(e.target.value)}
                                      placeholder="Version name"
                                      className="h-7 w-40 text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveVersionName(version.id)
                                        if (e.key === 'Escape') { setEditingVersionNameId(null); setEditingVersionName("") }
                                      }}
                                      autoFocus
                                    />
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleSaveVersionName(version.id)}>
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingVersionNameId(null); setEditingVersionName("") }}>
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    {version.name && <span className="text-sm text-muted-foreground">{version.name}</span>}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-1"
                                      onClick={() => { setEditingVersionNameId(version.id); setEditingVersionName(version.name || "") }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <span>{version.item_count} items</span>
                                <span>Created: {new Date(version.created_at).toLocaleDateString()}</span>
                              </div>
                              {version.source_ids && version.source_ids.length > 0 && (
                                <div className="text-xs text-muted-foreground mb-3">
                                  <span className="font-medium">Sources: </span>
                                  {version.source_ids.map((sid: string) => {
                                    const source = sources.find(s => s.id === sid)
                                    return source ? (source.label || source.url || source.file_name || 'Source') : 'Deleted source'
                                  }).join(', ')}
                                </div>
                              )}
                              {/* Item count comparison with active version */}
                              {(() => {
                                const activeVersion = versions.find(v => v.status === 'active')
                                if (activeVersion) {
                                  return (
                                    <div className="text-sm mb-3 p-2 bg-white rounded border">
                                      <span className="text-muted-foreground">Current: </span>
                                      <span className="font-medium">{activeVersion.item_count} items</span>
                                      <span className="text-muted-foreground"> / Draft: </span>
                                      <span className="font-medium">{version.item_count} items</span>
                                      {version.item_count > activeVersion.item_count && (
                                        <span className="text-green-600 ml-2">(+{version.item_count - activeVersion.item_count})</span>
                                      )}
                                      {version.item_count < activeVersion.item_count && (
                                        <span className="text-red-600 ml-2">({version.item_count - activeVersion.item_count})</span>
                                      )}
                                    </div>
                                  )
                                }
                                return null
                              })()}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewVersionItems(version.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Items
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAcceptVersion(version.id)}
                                disabled={acceptingVersionId === version.id}
                              >
                                {acceptingVersionId === version.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                Accept
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive hover:text-destructive"
                                      disabled={discardingVersionId === version.id}
                                    >
                                      {discardingVersionId === version.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                      )}
                                      Discard
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Discard Draft</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to discard this draft? This action cannot be undone and the draft version will be permanently deleted.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDiscardVersion(version.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Discard
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Active version card */}
                    {versions.filter(v => v.status === 'active').map((version) => (
                      <Card key={version.id} className="border-2 border-green-300 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-lg">v{version.version_number}</span>
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                                {editingVersionNameId === version.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      value={editingVersionName}
                                      onChange={(e) => setEditingVersionName(e.target.value)}
                                      placeholder="Version name"
                                      className="h-7 w-40 text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveVersionName(version.id)
                                        if (e.key === 'Escape') { setEditingVersionNameId(null); setEditingVersionName("") }
                                      }}
                                      autoFocus
                                    />
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleSaveVersionName(version.id)}>
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingVersionNameId(null); setEditingVersionName("") }}>
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    {version.name && <span className="text-sm text-muted-foreground">{version.name}</span>}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-1"
                                      onClick={() => { setEditingVersionNameId(version.id); setEditingVersionName(version.name || "") }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{version.item_count} items</span>
                                {version.activated_at && (
                                  <span>Activated: {new Date(version.activated_at).toLocaleDateString()}</span>
                                )}
                                <span>Created: {new Date(version.created_at).toLocaleDateString()}</span>
                              </div>
                              {version.source_ids && version.source_ids.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  <span className="font-medium">Sources: </span>
                                  {version.source_ids.map((sid: string) => {
                                    const source = sources.find(s => s.id === sid)
                                    return source ? (source.label || source.url || source.file_name || 'Source') : 'Deleted source'
                                  }).join(', ')}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewVersionItems(version.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Items
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Archived versions */}
                    {versions.filter(v => v.status === 'archived').map((version) => (
                      <Card key={version.id} className="border bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-lg">v{version.version_number}</span>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Archived
                                </Badge>
                                {editingVersionNameId === version.id ? (
                                  <div className="flex items-center gap-1">
                                    <Input
                                      value={editingVersionName}
                                      onChange={(e) => setEditingVersionName(e.target.value)}
                                      placeholder="Version name"
                                      className="h-7 w-40 text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveVersionName(version.id)
                                        if (e.key === 'Escape') { setEditingVersionNameId(null); setEditingVersionName("") }
                                      }}
                                      autoFocus
                                    />
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleSaveVersionName(version.id)}>
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditingVersionNameId(null); setEditingVersionName("") }}>
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    {version.name && <span className="text-sm text-muted-foreground">{version.name}</span>}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-1"
                                      onClick={() => { setEditingVersionNameId(version.id); setEditingVersionName(version.name || "") }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{version.item_count} items</span>
                                {version.archived_at && (
                                  <span>Archived: {new Date(version.archived_at).toLocaleDateString()}</span>
                                )}
                                <span>Created: {new Date(version.created_at).toLocaleDateString()}</span>
                              </div>
                              {version.source_ids && version.source_ids.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  <span className="font-medium">Sources: </span>
                                  {version.source_ids.map((sid: string) => {
                                    const source = sources.find(s => s.id === sid)
                                    return source ? (source.label || source.url || source.file_name || 'Source') : 'Deleted source'
                                  }).join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewVersionItems(version.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Items
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={restoringVersionId === version.id}
                                  >
                                    {restoringVersionId === version.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                    )}
                                    Restore
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Restore Version</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will restore version {version.version_number} as the active menu version. The current active version will be archived.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRestoreVersion(version.id)}>
                                      Restore Version
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Version Items Modal */}
        <Dialog open={previewVersionId !== null} onOpenChange={(open) => !open && setPreviewVersionId(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Version Items Preview
                {previewVersionId && versions.find(v => v.id === previewVersionId) && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    (v{versions.find(v => v.id === previewVersionId)?.version_number})
                  </span>
                )}
              </DialogTitle>
              <DialogDescription>
                {previewItems.length} items in this version
              </DialogDescription>
            </DialogHeader>
            {loadingPreviewItems ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading items...</span>
              </div>
            ) : previewItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items in this version
              </div>
            ) : (
              <div className="space-y-3">
                {/* Group items by category */}
                {Array.from(new Set(previewItems.map(item => item.category || 'Other'))).map(category => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">{category}</h4>
                    <div className="space-y-2">
                      {previewItems.filter(item => (item.category || 'Other') === category).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            {item.description && (
                              <span className="text-muted-foreground ml-2 text-xs">
                                {item.description.length > 50 ? item.description.slice(0, 50) + '...' : item.description}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {formatPrice(item.price, menuData?.restaurant?.currency_code)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewVersionId(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Menu Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : null,
                          )
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, category: e.target.value } : null))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergens">Allergens (comma separated)</Label>
                    <Input
                      id="allergens"
                      value={editingItem.allergens?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev
                            ? {
                                ...prev,
                                allergens: e.target.value
                                  .split(",")
                                  .map((a) => a.trim())
                                  .filter((a) => a),
                              }
                            : null,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tags">Tags</Label>
                  <TagSelector
                    selectedTags={editingItem.tags || []}
                    onTagsChange={(tags) =>
                      setEditingItem((prev) => (prev ? { ...prev, tags } : null))
                    }
                    placeholder="Search for tags to add..."
                    maxTags={10}
                  />
                  
                  {/* Legacy dietary checkboxes for backward compatibility */}
                  <details className="mt-4">
                    <summary className="text-sm text-gray-600 cursor-pointer">Legacy dietary options</summary>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.is_vegetarian}
                          onChange={(e) =>
                            setEditingItem((prev) => (prev ? { ...prev, is_vegetarian: e.target.checked } : null))
                          }
                        />
                        Vegetarian
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.is_vegan}
                          onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, is_vegan: e.target.checked } : null))}
                        />
                        Vegan
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.is_gluten_free}
                          onChange={(e) =>
                            setEditingItem((prev) => (prev ? { ...prev, is_gluten_free: e.target.checked } : null))
                          }
                        />
                        Gluten Free
                      </label>
                    </div>
                  </details>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => editingItem && handleUpdateItem(editingItem)}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Item Modal */}
        {addingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add New Item to {addingItem}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitNewItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newItemName">Item Name</Label>
                      <Input
                        id="newItemName"
                        name="name"
                        required
                        placeholder="Enter item name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newItemPrice">Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="newItemPrice"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newItemDescription">Description</Label>
                    <Textarea
                      id="newItemDescription"
                      name="description"
                      rows={3}
                      placeholder="Enter item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newItemAllergens">Allergens (comma separated)</Label>
                    <Input
                      id="newItemAllergens"
                      name="allergens"
                      placeholder="e.g., nuts, dairy, gluten"
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setAddingItem(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
