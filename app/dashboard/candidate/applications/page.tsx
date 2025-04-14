"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Briefcase, Building, MapPin } from "lucide-react"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"
import { toast } from "sonner"

interface Application {
  _id: string
  positionId: string
  position: {
    title: string
    department: string
    location: string
    type: string
    workLocation: string
  }
  company: {
    name: string
  }
  status: "pending" | "reviewed" | "shortlisted" | "rejected"
  createdAt: string
  updatedAt: string
}

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "shortlisted":
      return "default"
    case "pending":
      return "secondary"
    case "reviewed":
      return "outline"
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function ApplicationsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "candidate") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/applications")
        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
        toast.error("Failed to load applications")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "candidate") {
      fetchApplications()
    }
  }, [status, session])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Applications</h1>
            <p className="text-gray-500">Track the status of your job applications</p>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Applications</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications.map((application) => (
                  <Card key={application._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{application.position.title}</CardTitle>
                          <CardDescription>{application.company.name}</CardDescription>
                        </div>
                        <Badge variant={getBadgeVariant(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span>{application.position.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{application.position.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{application.position.type} - {application.position.workLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Applied on {formatDate(application.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => router.push(`/positions/${application.positionId}`)}
                      >
                        View Position Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {applications.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
                    <p className="text-gray-500 max-w-md">
                      You haven't applied for any positions yet. Browse available positions and apply to get started.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications
                  .filter((application) => application.status === "pending")
                  .map((application) => (
                    <Card key={application._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{application.position.title}</CardTitle>
                            <CardDescription>{application.company.name}</CardDescription>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span>{application.position.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{application.position.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{application.position.type} - {application.position.workLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Applied on {formatDate(application.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => router.push(`/positions/${application.positionId}`)}
                        >
                          View Position Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                {applications.filter((application) => application.status === "pending").length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
                    <p className="text-gray-500 max-w-md">
                      You don't have any pending applications. All your applications have been reviewed.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shortlisted" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications
                  .filter((application) => application.status === "shortlisted")
                  .map((application) => (
                    <Card key={application._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{application.position.title}</CardTitle>
                            <CardDescription>{application.company.name}</CardDescription>
                          </div>
                          <Badge variant="default">Shortlisted</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span>{application.position.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{application.position.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{application.position.type} - {application.position.workLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Applied on {formatDate(application.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => router.push(`/positions/${application.positionId}`)}
                        >
                          View Position Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                {applications.filter((application) => application.status === "shortlisted").length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Shortlisted Applications</h3>
                    <p className="text-gray-500 max-w-md">
                      You don't have any shortlisted applications yet. Keep applying to increase your chances.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications
                  .filter((application) => application.status === "rejected")
                  .map((application) => (
                    <Card key={application._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{application.position.title}</CardTitle>
                            <CardDescription>{application.company.name}</CardDescription>
                          </div>
                          <Badge variant="destructive">Rejected</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span>{application.position.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{application.position.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{application.position.type} - {application.position.workLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Applied on {formatDate(application.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => router.push(`/positions/${application.positionId}`)}
                        >
                          View Position Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                {applications.filter((application) => application.status === "rejected").length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Rejected Applications</h3>
                    <p className="text-gray-500 max-w-md">
                      You don't have any rejected applications. Keep up the good work!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
} 