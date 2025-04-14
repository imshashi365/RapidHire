"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, Plus, Users, Calendar, MoreHorizontal, Edit, Trash2, Copy, MapPin, Briefcase, Eye, IndianRupee, Clock } from "lucide-react"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PositionModal } from "./components/PositionModal"
import { toast } from "sonner"

interface Position {
  _id: string
  title: string
  department: string
  location: string
  type: string
  workLocation: string
  description: string
  requirements: string[]
  questions: string[]
  minExperience: number
  maxExperience: number
  salaryRange: {
    min: number
    max: number
  }
  active: boolean
  companyName: string
  lastDate: string
  updatedAt: string
  createdAt: string
}

interface ApplicationCount {
  positionId: string
  count: number
}

export default function PositionsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | undefined>()
  const [positions, setPositions] = useState<Position[]>([])
  const [applicationCounts, setApplicationCounts] = useState<ApplicationCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "company") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || session?.user?.role !== "company") {
        return
      }

      try {
        // Fetch positions
        const positionsResponse = await fetch("/api/positions", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`
          },
        })
        
        if (!positionsResponse.ok) {
          throw new Error("Failed to fetch positions")
        }
        
        const positionsData = await positionsResponse.json()
        setPositions(positionsData)

        // Fetch application counts
        const countsResponse = await fetch("/api/positions/counts", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`
          },
        })

        if (!countsResponse.ok) {
          throw new Error("Failed to fetch application counts")
        }

        const countsData = await countsResponse.json()
        setApplicationCounts(countsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [status, session])

  const getApplicationCount = (positionId: string) => {
    const count = applicationCounts.find(count => count.positionId === positionId)
    return count?.count || 0
  }

  const handleCreatePosition = () => {
    setSelectedPosition(undefined)
    setIsModalOpen(true)
  }

  const handleEditPosition = (position: Position) => {
    setSelectedPosition(position)
    setIsModalOpen(true)
  }

  const handleDeletePosition = async (id: string) => {
    if (!id) {
      toast.error("Position ID is missing")
      return
    }

    try {
      const response = await fetch(`/api/positions?id=${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete position")
      }

      toast.success("Position deleted successfully")
      setPositions(positions.filter(p => p._id !== id))
    } catch (error) {
      console.error("Delete position error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete position")
    }
  }

  const formatSalary = (min: number, max: number) => {
    return `₹${min}L - ₹${max}L`
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />

      <div className="flex flex-1">
        <CompanyDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Positions</h1>
            <Button onClick={handleCreatePosition}>
              <Plus className="mr-2 h-4 w-4" />
              Create Position
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {positions.map((position) => (
              <Card key={position._id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{position.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {position.department} • {position.location}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditPosition(position)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePosition(position._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{position.type}</span>
                      </div>
                      <Badge variant={position.active ? "default" : "secondary"}>
                        {position.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{position.workLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IndianRupee className="h-4 w-4" />
                      <div className="text-sm text-gray-500">
                        {formatSalary(position.salaryRange.min, position.salaryRange.max)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{getApplicationCount(position._id)} applications</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Updated {new Date(position.updatedAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/positions/${position._id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <PositionModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedPosition(undefined)
            }}
            position={selectedPosition}
          />
        </main>
      </div>
    </div>
  )
}

