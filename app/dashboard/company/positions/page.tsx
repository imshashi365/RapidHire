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
import { Search, Filter, Plus, Users, Calendar, MoreHorizontal, Edit, Trash2, Copy, MapPin, Briefcase, Eye, IndianRupee, Clock, MoreVertical, PenSquare, DollarSign, Building2 } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

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
  salary: string | {
    min: number
    max: number
    currency: string
  }
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
  const [error, setError] = useState<string | null>(null)

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
          },
        })
        
        if (!positionsResponse.ok) {
          throw new Error("Failed to fetch positions")
        }
        
        const positionsData = await positionsResponse.json()
        // Ensure positions is an array and has the expected structure
        const positionsArray = Array.isArray(positionsData.positions) ? positionsData.positions : []
        console.log('Fetched positions:', positionsArray) // Debug log
        setPositions(positionsArray)

        // Fetch application counts
        const countsResponse = await fetch("/api/positions/counts", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!countsResponse.ok) {
          throw new Error("Failed to fetch application counts")
        }

        const countsData = await countsResponse.json()
        setApplicationCounts(countsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to load data")
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

  const formatSalary = (salary: Position['salary']) => {
    if (!salary) return 'Salary not specified'

    if (typeof salary === 'string') return salary

    if (typeof salary === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(salary)
    }

    if (typeof salary === 'object') {
      try {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: salary.currency || 'USD',
          maximumFractionDigits: 0
        })
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`
      } catch (error) {
        console.error('Error formatting salary:', error)
        if ('min' in salary && 'max' in salary) {
          return `${salary.min} - ${salary.max} ${salary.currency || 'USD'}`
        }
      }
    }

    return 'Salary not specified'
  }

  const getWorkLocationColor = (workLocation: string) => {
    switch (workLocation.toLowerCase()) {
      case 'remote':
        return 'bg-green-500/10 text-green-500'
      case 'hybrid':
        return 'bg-blue-500/10 text-blue-500'
      case 'onsite':
        return 'bg-orange-500/10 text-orange-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      const url = selectedPosition 
        ? `/api/positions?id=${selectedPosition._id}`
        : '/api/positions'
      
      const method = selectedPosition ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save position')
      }
      
      if (selectedPosition) {
        // Update existing position
        setPositions(positions.map(p => 
          p._id === selectedPosition._id ? { ...p, ...data.position } : p
        ))
        toast.success('Position updated successfully')
      } else {
        // Add new position
        const newPosition = {
          ...formData,
          _id: data.positionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setPositions([newPosition, ...positions])
        toast.success('Position created successfully')
      }

      setIsModalOpen(false)
      setSelectedPosition(undefined)
    } catch (error) {
      console.error('Error saving position:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save position')
      throw error
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push('/login')
    return null
  }

  if (session?.user.role !== 'company') {
    router.push('/dashboard/candidate')
    return null
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

          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : positions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No positions yet</p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first job position to start hiring.</p>
                <Button onClick={handleCreatePosition}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positions.map((position) => (
                position && (
                  <Card key={position._id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl mb-2">{position.title || 'Untitled Position'}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {position.companyName || 'Unknown Company'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditPosition(position)}>
                              <PenSquare className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeletePosition(position._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatSalary(position.salary)}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {position.location || 'Location not specified'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <Badge variant="secondary" className={getWorkLocationColor(position.workLocation)}>
                            {position.workLocation ? position.workLocation.charAt(0).toUpperCase() + position.workLocation.slice(1) : 'Not specified'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {getApplicationCount(position._id)} {getApplicationCount(position._id) === 1 ? 'application' : 'applications'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="text-sm text-gray-500 flex items-center justify-between">
                      <span>Posted {position.createdAt ? new Date(position.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/positions/${position._id}`)}
                        className="ml-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </CardFooter>
                  </Card>
                )
              ))}
            </div>
          )}

          <PositionModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedPosition(undefined)
            }}
            onSubmit={handleSubmit}
            position={selectedPosition}
          />
        </main>
      </div>
    </div>
  )
}

