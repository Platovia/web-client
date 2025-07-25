"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Trash2, Plus, Edit, Eye, DollarSign, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isAvailable: boolean
}

// Dummy menu data
const dummyMenuData = {
  id: "menu-1",
  name: "Main Menu",
  restaurant: "Bella Vista Italian",
  description: "Our complete dining menu with appetizers, mains, and desserts",
  status: "active",
  items: [
    {
      id: "item-1",
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomato sauce, basil on wood-fired crust",
      price: 18.99,
      category: "Pizza",
      allergens: ["gluten", "dairy"],
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true,
    },
    {
      id: "item-2",
      name: "Spaghetti Carbonara",
      description: "Eggs, pancetta, parmesan, black pepper with fresh pasta",
      price: 22.99,
      category: "Pasta",
      allergens: ["gluten", "dairy", "eggs"],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true,
    },
    {
      id: "item-3",
      name: "Caesar Salad",
      description: "Romaine lettuce, croutons, parmesan, caesar dressing",
      price: 14.99,
      category: "Salads",
      allergens: ["dairy"],
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isAvailable: true,
    },
  ],
}

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [menuData, setMenuData] = useState(dummyMenuData)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [success, setSuccess] = useState("")

  const categories = Array.from(new Set(menuData.items.map((item) => item.category)))

  const handleSaveMenu = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSuccess("Menu updated successfully!")
      setIsLoading(false)

      setTimeout(() => setSuccess(""), 3000)
    }, 1500)
  }

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setMenuData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    }))
    setEditingItem(null)
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      setMenuData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }))
    }
  }

  const toggleItemAvailability = (itemId: string) => {
    setMenuData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item)),
    }))
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
                {menuData.name} - {menuData.restaurant}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/menu/${params.id}`}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button onClick={handleSaveMenu} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="settings">Menu Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            {/* Menu Items by Category */}
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category}</CardTitle>
                    <Button size="sm">
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
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-600">
                                  ${item.price.toFixed(2)}
                                </Badge>
                                {!item.isAvailable && <Badge variant="destructive">Unavailable</Badge>}
                                {item.isVegetarian && (
                                  <Badge variant="outline" className="text-green-600">
                                    Vegetarian
                                  </Badge>
                                )}
                                {item.isVegan && (
                                  <Badge variant="outline" className="text-green-700">
                                    Vegan
                                  </Badge>
                                )}
                                {item.isGlutenFree && (
                                  <Badge variant="outline" className="text-blue-600">
                                    Gluten Free
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            {item.allergens.length > 0 && (
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-gray-500">Allergens: {item.allergens.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant={item.isAvailable ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleItemAvailability(item.id)}
                            >
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
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
                      value={menuData.name}
                      onChange={(e) => setMenuData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={menuData.status}
                      onChange={(e) => setMenuData((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={menuData.description}
                    onChange={(e) => setMenuData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Menu Analytics</CardTitle>
                <CardDescription>Performance metrics for this menu</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics data will be displayed here...</p>
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
                      value={editingItem.allergens.join(", ")}
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

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isVegetarian}
                      onChange={(e) =>
                        setEditingItem((prev) => (prev ? { ...prev, isVegetarian: e.target.checked } : null))
                      }
                    />
                    Vegetarian
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isVegan}
                      onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, isVegan: e.target.checked } : null))}
                    />
                    Vegan
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isGlutenFree}
                      onChange={(e) =>
                        setEditingItem((prev) => (prev ? { ...prev, isGlutenFree: e.target.checked } : null))
                      }
                    />
                    Gluten Free
                  </label>
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
      </div>
    </DashboardLayout>
  )
}
