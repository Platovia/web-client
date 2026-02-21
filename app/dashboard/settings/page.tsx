"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type UserUpdateRequest, type CompanyUpdateRequest } from "@/lib/api"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { companies, refreshCompanies } = useAuth()
  const { toast } = useToast()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Company fields (primary company for now)
  const primaryCompany = companies?.[0]
  const [companyName, setCompanyName] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "")
      setLastName(user.last_name || "")
      setEmail(user.email || "")
    }
    if (primaryCompany) {
      setCompanyName(primaryCompany.name || "")
      setCompanyDescription(primaryCompany.description || "")
      const contact = (primaryCompany as any).contact_info || {}
      setCompanyPhone(contact.phone || "")
      setCompanyAddress(contact.address || "")
    }
  }, [user, primaryCompany])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const payload: UserUpdateRequest = {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      }
      const res = await apiClient.updateCurrentUser(payload)
      if (res.error) {
        toast({ title: "Failed to save", description: res.error })
        return
      }
      await refreshUser()
      toast({ title: "Profile updated", description: "Your profile has been saved." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCompany = async () => {
    if (!primaryCompany) return
    setIsSaving(true)
    try {
      const payload: CompanyUpdateRequest = {
        name: companyName.trim() || undefined,
        description: companyDescription.trim() || undefined,
        contact_info: {
          phone: companyPhone || undefined,
          address: companyAddress || undefined,
        },
      }
      const res = await apiClient.updateCompany(primaryCompany.id, payload)
      if (res.error) {
        toast({ title: "Failed to save", description: res.error })
        return
      }
      await refreshCompanies()
      toast({ title: "Company updated", description: "Company details have been saved." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_name">Company name</Label>
                <Input id="company_name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_description">Description</Label>
                <Input id="company_description" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_phone">Phone</Label>
                <Input id="company_phone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_address">Address</Label>
                <Input id="company_address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handleSaveCompany} disabled={isSaving || !primaryCompany}>
                {isSaving ? "Saving..." : "Save company"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Link href="/dashboard/settings/billing" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>Billing & Usage</CardTitle>
              <CardDescription>Manage your subscription and view usage</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your current plan, usage statistics, and upgrade or manage your subscription.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  )
}


