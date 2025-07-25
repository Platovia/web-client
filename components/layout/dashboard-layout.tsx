"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  QrCode,
  Home,
  Store,
  Menu,
  BarChart3,
  Settings,
  Users,
  MessageCircle,
  Upload,
  LogOut,
  User,
  Bell,
} from "lucide-react"

// Add ProtectedRoute wrapper and better user state
import ProtectedRoute from "@/components/auth/protected-route"

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Restaurants",
    items: [
      { title: "All Restaurants", url: "/dashboard/restaurants", icon: Store },
      { title: "Add Restaurant", url: "/dashboard/restaurants/new", icon: Store },
    ],
  },
  {
    title: "Menu Management",
    items: [
      { title: "All Menus", url: "/dashboard/menus", icon: Menu },
      { title: "Upload Menu", url: "/dashboard/menus/upload", icon: Upload },
      { title: "QR Codes", url: "/dashboard/qr-codes", icon: QrCode },
    ],
  },
  {
    title: "Customer Support",
    items: [
      { title: "Chat Analytics", url: "/dashboard/chat", icon: MessageCircle },
      { title: "Customer Feedback", url: "/dashboard/feedback", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Account Settings", url: "/dashboard/settings", icon: Settings },
      { title: "Team Management", url: "/dashboard/team", icon: Users },
    ],
  },
]

// Update the component to include protection
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Provide default values without requiring authentication
    const email = localStorage.getItem("userEmail") || "demo@example.com"
    const company = localStorage.getItem("companyName") || "Demo Company"
    const name = localStorage.getItem("userName") || "Demo User"
    setUserEmail(email)
    setCompanyName(company)
    setUserName(name)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div>
                <span className="text-lg font-bold text-gray-900">MenuAI</span>
                <p className="text-xs text-gray-600">{companyName}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {navigation.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium truncate">{userName || userEmail}</span>
                        <span className="text-xs text-gray-500 truncate">{companyName}</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
