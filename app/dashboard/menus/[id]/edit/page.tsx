"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Trash2, Plus, Edit, Eye, DollarSign, Loader2, CheckCircle, AlertTriangle, QrCode, Clock } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ImageMatchingTabContent from "@/components/image-matching/image-matching-tab"
import { apiClient, type Menu, type MenuItem, type MenuUpdateRequest, type MenuItemCreateRequest, type MenuItemUpdateRequest, type Restaurant } from "@/lib/api"
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
  const [error, setError] = useState("")

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
      try {
        const latestJob = await apiClient.getLatestOCRJobForMenu(id)
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
        setSuccess("Menu uploaded successfully! Review and edit the extracted items below.")
      }
    } catch (err) {
      console.error("Error loading menu data:", err)
      setError("Failed to load menu data")
    } finally {
      setIsLoading(false)
    }
  }, [id, fromUpload])

  useEffect(() => {
    if (id) {
      loadMenuData()
    }
  }, [id, loadMenuData])

  const categories = menuData ? Array.from(new Set(menuData.items.map((item) => item.category || "Other").filter(Boolean))) : []

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
      const response = await apiClient.createMenuItem(id, itemData)
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
            <Link href={menuData.menu.qr_code_data || `/dashboard/menus/${id}/qr`} target={menuData.menu.qr_code_data ? "_blank" : "_self"}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {menuData.menu.qr_code_data ? "Preview" : "Generate QR"}
              </Button>
            </Link>
            <Button onClick={handleSaveMenu} disabled={isSaving || Boolean(processing)}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button onClick={handleDeleteMenu} variant="destructive" disabled={Boolean(processing)}>
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

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="image-matching">Image Matching</TabsTrigger>
            <TabsTrigger value="settings">Menu Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {processing && (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This menu is currently processing. Editing is temporarily disabled. Please check back shortly.
                </AlertDescription>
              </Alert>
            )}
            {/* Menu Items by Category */}
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category}</CardTitle>
                    <Button size="sm" onClick={() => setAddingItem(category)} disabled={Boolean(processing)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuData.items
                      .filter((item) => item.category === category)
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
                              disabled={Boolean(processing)}
                            >
                              {item.is_available ? "Available" : "Unavailable"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingItem(item)} disabled={Boolean(processing)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)} disabled={Boolean(processing)}>
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
            <ImageMatchingTabContent menuId={id} />
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
          </TabsContent>
        </Tabs>

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
