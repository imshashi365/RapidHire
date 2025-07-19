"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import { toast } from "sonner"

interface CompanyProfile {
  id: string
  name: string
  email: string
  username: string
}

export default function CompanyProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if user is authenticated
        if (status === "unauthenticated") {
          router.push("/login")
          return
        }

        // Check if session is loading
        if (status === "loading") {
          return
        }

        // Check if user is a company
        if (!session?.user || session.user.role !== "company") {
          setError("Access denied. Company account required.")
          return
        }

        // Check if username exists
        if (!session.user.username) {
          setError("Company profile not found. Please contact support.")
          return
        }

        const response = await fetch(`/api/companies/${session.user.username}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Company profile not found. Please contact support.")
          } else {
            throw new Error("Failed to fetch company profile")
          }
          return
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile")
        toast.error("Failed to load company profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CompanyDashboardHeader />
        <div className="flex flex-1">
          <CompanyDashboardSidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-full">
              <p>Loading profile...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <CompanyDashboardHeader />
        <div className="flex flex-1">
          <CompanyDashboardSidebar />
          <main className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => router.push("/dashboard/company")}>
                Return to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />
      <div className="flex flex-1">
        <CompanyDashboardSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  View and manage your company profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={profile?.name || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile?.username || ""}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 