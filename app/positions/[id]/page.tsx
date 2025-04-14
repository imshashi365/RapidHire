"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { use } from "react"
import { Briefcase, MapPin, Clock, DollarSign, Building, Calendar, Award, FileText, IndianRupee } from "lucide-react"

interface Position {
  _id: string
  title: string
  department: string
  location: string
  type: string
  workLocation: string
  description: string
  requirements: string[]
  questions?: string[]
  minExperience: number
  maxExperience: number
  salaryRange: {
    min: number
    max: number
  }
  active: boolean
  companyName: string
  lastDate: string
  createdBy: {
    name: string
  }
  salary?: {
    min: number
    max: number
    currency: string
  }
}

interface PositionPageProps {
  params: Promise<{ id: string }>
}

const PositionPage = ({ params }: PositionPageProps) => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [position, setPosition] = useState<Position | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // Use React.use() to unwrap the params promise
  const { id } = use(params)

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await fetch(`/api/positions/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch position")
        }
        const data = await response.json()
        setPosition(data)
      } catch (error) {
        console.error("Error fetching position:", error)
        toast.error("Failed to load position details")
      } finally {
        setIsLoading(false)
      }
    }

    const checkApplicationStatus = async () => {
      if (status === "authenticated" && session?.user?.role === "candidate") {
        try {
          const response = await fetch(`/api/applications/check?positionId=${id}`)
          if (response.ok) {
            const data = await response.json()
            setHasApplied(data.hasApplied)
          }
        } catch (error) {
          console.error("Error checking application status:", error)
        }
      }
    }

    fetchPosition()
    checkApplicationStatus()
  }, [id, status, session])

  const handleApply = async () => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user?.role !== "candidate") {
      toast.error("Only candidates can apply for positions")
      return
    }

    try {
      setIsApplying(true)
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          positionId: id,
          candidateId: session.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error === "You have already applied for this position") {
          toast.error("You have already applied for this position")
          router.push("/dashboard/candidate/interviews")
          return
        }
        throw new Error(data.error || "Failed to apply for position")
      }

      toast.success("Application submitted successfully")
      router.push("/dashboard/candidate/interviews")
    } catch (error) {
      console.error("Error applying for position:", error)
      toast.error(error instanceof Error ? error.message : "Failed to apply for position")
    } finally {
      setIsApplying(false)
    }
  }

  const formatSalary = (position: Position) => {
    // Check for salaryRange first
    if (position.salaryRange?.min && position.salaryRange?.max) {
      return `₹${position.salaryRange.min}L - ₹${position.salaryRange.max}L`
    }
    // Fallback to salary if salaryRange is not available
    if (position.salary?.min && position.salary?.max) {
      const currency = position.salary.currency || '₹'
      return `${currency}${position.salary.min}L - ${currency}${position.salary.max}L`
    }
    // Return a default message if no salary information is available
    return "Salary not specified"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-4xl">😕</div>
        <h1 className="text-2xl font-bold">Position Not Found</h1>
        <p className="text-gray-500">The position you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" onClick={() => router.push("/positions")}>
          Browse Other Positions
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{position.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{position.companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{position.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">
                  {position.type}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {position.workLocation}
                </Badge>
              </div>
              <Button
                onClick={handleApply}
                disabled={isApplying || status === "loading" || hasApplied}
                className="w-full md:w-auto"
                size="lg"
              >
                {hasApplied ? "Already Applied" : isApplying ? "Applying..." : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line">{position.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {position.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Job Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Experience</span>
                  </div>
                  <p className="font-medium">
                    {position.minExperience} - {position.maxExperience} years
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    <span>{formatSalary(position)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last Date to Apply</span>
                  </div>
                  <p className="font-medium">
                    {new Date(position.lastDate).toLocaleDateString()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Department</span>
                  </div>
                  <p className="font-medium">{position.department}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <p className="font-medium">{position.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PositionPage 