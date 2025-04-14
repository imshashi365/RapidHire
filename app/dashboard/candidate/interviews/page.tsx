"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, CheckCircle, ChevronRight, Search, Filter, Video, Play, Loader2 } from "lucide-react"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"
import { CandidateDashboardSidebar } from "@/components/candidate-dashboard-sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Interview, InterviewStatus } from "@/types/interview"
import { format } from "date-fns"

// Update the Badge variants to use valid values
const getBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default"
    case "scheduled":
      return "outline"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

const getStatusColor = (status: InterviewStatus) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function InterviewsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching interviews...")
        
        const response = await fetch("/api/interviews", {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch interviews")
        }
        
        const data = await response.json()
        console.log("Raw interviews data:", data)
        
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received")
        }
        
        setInterviews(data)
        console.log("Interviews state updated:", data)
      } catch (err) {
        console.error("Error fetching interviews:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchInterviews()
    }
  }, [session])

  const filteredInterviews = interviews.filter(interview => {
    const searchLower = searchQuery.toLowerCase()
    return (
      interview.position?.title?.toLowerCase().includes(searchLower) ||
      interview.position?.companyName?.toLowerCase().includes(searchLower) ||
      interview.status?.toLowerCase().includes(searchLower)
    )
  })

  const scheduledInterviews = filteredInterviews.filter(
    (interview) => interview?.status === "scheduled" || interview?.status === "pending"
  ).filter(interview => interview?.position)

  const completedInterviews = filteredInterviews.filter(
    (interview) => interview?.status === "completed" && interview?.position
  )

  const cancelledInterviews = filteredInterviews.filter(
    (interview) => interview?.status === "cancelled" && interview?.position
  )

  // Add debug logging for filtered interviews
  useEffect(() => {
    console.log("Filtered interviews:", filteredInterviews)
    console.log("Scheduled interviews:", scheduledInterviews)
  }, [filteredInterviews, scheduledInterviews])

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview)
    setIsViewDetailsOpen(true)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not scheduled"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Not scheduled"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Not scheduled"
    }
  }

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Not scheduled"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Not scheduled"
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    } catch (error) {
      console.error("Error formatting time:", error)
      return "Not scheduled"
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Not scheduled"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Not scheduled"
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    } catch (error) {
      console.error("Error formatting date and time:", error)
      return "Not scheduled"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <div className="flex flex-1">
        <CandidateDashboardSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">My Interviews</h1>
            <p className="text-gray-500">View and manage all your interviews</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interviews..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="scheduled" className="space-y-4">
            <TabsList>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="all">All Interviews</TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledInterviews.map((interview) => (
                  <Card key={interview.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{interview.position?.title || "Untitled Position"}</CardTitle>
                          <CardDescription>{interview.position?.department || "No Department"}</CardDescription>
                          <div className="mt-2 text-sm text-gray-500">
                            Company: {interview.position?.companyName || "No Company"}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Last Date to Complete: {formatDate(interview.lastDate)}
                          </div>
                        </div>
                        <Badge variant={getBadgeVariant(interview.status)}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {interview.date ? (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{formatDate(interview.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{formatTime(interview.date)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Interview date not scheduled yet</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span>Video Interview</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleViewDetails(interview)}>
                        {interview.status === "pending" ? "Start Interview" : "Join Interview"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {scheduledInterviews.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Scheduled Interviews</h3>
                    <p className="text-gray-500 max-w-md">
                      You don't have any scheduled interviews. Check your upcoming interviews or wait for new invitations.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedInterviews.map((interview) => (
                  <Card key={interview.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="bg-slate-100 h-32 flex items-center justify-center">
                          <Video className="h-10 w-10 text-gray-400" />
                        </div>
                        <Button
                          size="icon"
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full h-12 w-12"
                          onClick={() => handleViewDetails(interview)}
                        >
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="font-medium">{interview.position?.title || "Untitled Position"}</h3>
                          <p className="text-sm text-gray-500">{interview.position?.companyName || "No Company"}</p>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="default">Completed</Badge>
                          {interview.score && (
                            <span className="font-medium">{interview.score}/100</span>
                          )}
                        </div>

                        {interview.feedback && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{interview.feedback}</p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(interview.date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t p-3 bg-slate-50 flex justify-end">
                        <Button size="sm" onClick={() => handleViewDetails(interview)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {completedInterviews.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Completed Interviews</h3>
                    <p className="text-gray-500 max-w-md">
                      You haven't completed any interviews yet. Once you complete an interview, you'll see your results
                      here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledInterviews.map((interview) => (
                  <Card key={interview.id} className="mb-4">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{interview.position?.title || "Untitled Position"}</CardTitle>
                          <CardDescription>{interview.position?.department || "No Department"}</CardDescription>
                          <div className="mt-2 text-sm text-gray-500">
                            Company: {interview.position?.companyName || "No Company"}
                          </div>
                        </div>
                        <Badge variant="destructive">Cancelled</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(interview.date)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleViewDetails(interview)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {cancelledInterviews.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Cancelled Interviews</h3>
                    <p className="text-gray-500 max-w-md">
                      You don't have any cancelled interviews.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-12 px-4 text-left font-medium">Position</th>
                        <th className="h-12 px-4 text-left font-medium">Company</th>
                        <th className="h-12 px-4 text-left font-medium">Status</th>
                        <th className="h-12 px-4 text-left font-medium">Date</th>
                        <th className="h-12 px-4 text-left font-medium">Score</th>
                        <th className="h-12 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInterviews.map((interview) => (
                        <tr key={interview.id} className="border-b">
                          <td className="p-4 font-medium">{interview.position?.title || "Untitled Position"}</td>
                          <td className="p-4">{interview.position?.companyName || "No Company"}</td>
                          <td className="p-4">
                            <Badge variant={getBadgeVariant(interview.status)}>
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {interview.date ? formatDate(interview.date) : "—"}
                          </td>
                          <td className="p-4">{interview.score ? `${interview.score}/100` : "—"}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(interview)}>
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* View Interview Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedInterview && (
            <>
              <DialogHeader>
                <DialogTitle>Interview Details</DialogTitle>
                <DialogDescription>
                  {selectedInterview.position.title} at {selectedInterview.position.companyName}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={getBadgeVariant(selectedInterview.status)}>
                    {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {selectedInterview.date && formatDate(selectedInterview.date)}
                    {selectedInterview.date && ` at ${formatTime(selectedInterview.date)}`}
                  </span>
                </div>

                {selectedInterview.status === "completed" && (
                  <div className="space-y-6">
                    {selectedInterview.score && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Overall Score</h3>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{selectedInterview.score}/100</span>
                        </div>
                        <Progress value={selectedInterview.score} className="h-2" />
                      </div>
                    )}

                    {selectedInterview.feedback && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Feedback</h3>
                        <p className="text-sm text-gray-700">{selectedInterview.feedback}</p>
                      </div>
                    )}

                    <div className="rounded-lg border overflow-hidden">
                      <div className="relative bg-slate-100 h-48 flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-400" />
                        <Button
                          size="icon"
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full h-14 w-14"
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="p-3 bg-white border-t">
                        <span className="text-sm text-gray-500">Interview Recording</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedInterview.status === "scheduled" && (
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 bg-blue-50 text-blue-800">
                      <p>
                        Your interview is scheduled for {formatDate(selectedInterview.date)} at{" "}
                        {formatTime(selectedInterview.date)}. Make sure to be prepared and join on time.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Preparation Tips</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Find a quiet place with good lighting</li>
                        <li>Test your camera and microphone beforehand</li>
                        <li>Have a copy of your resume nearby</li>
                        <li>Prepare examples of your past work and experiences</li>
                        <li>Research the company and position</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedInterview.status === "pending" && (
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 bg-amber-50 text-amber-800">
                      <p>
                        You've been invited to an interview for {selectedInterview.position.title} at{" "}
                        {selectedInterview.position.companyName}.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">What to Expect</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>The interview will take approximately 15 minutes</li>
                        <li>You'll be asked questions related to the position</li>
                        <li>Your responses will be recorded and analyzed</li>
                        <li>You can complete the interview at any time</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  Close
                </Button>
                {selectedInterview.status === "completed" && <Button>View Full Report</Button>}
                {selectedInterview.status === "pending" && (
                  <Button onClick={() => {
                    setIsViewDetailsOpen(false)
                    router.push(`/dashboard/candidate/interviews/${selectedInterview.id}`)
                  }}>
                    Start Interview
                  </Button>
                )}
                {selectedInterview.status === "scheduled" && (
                  <Button onClick={() => {
                    setIsViewDetailsOpen(false)
                    router.push(`/dashboard/candidate/interviews/${selectedInterview.id}`)
                  }}>
                    Join Interview
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

