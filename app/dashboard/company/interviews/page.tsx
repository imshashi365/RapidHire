"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Check, X, Search, Loader2 } from "lucide-react"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InterviewStatus } from "@/types/interview"

interface Interview {
  _id: string
  candidateEmail: string
  position: {
    _id: string
    title: string
    companyId: string
  }
  status: InterviewStatus
  date: string
  score?: number
}

interface InterviewFeedback {
  feedback: {
    rating: {
      englishCommunication: number
      confidence: number
      storytelling: number
      customerHandling: number
    }
    summary: string
    recommendation: string
    recommendationMsg: string
  }
}

export default function InterviewsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/company/interviews")
      if (!response.ok) {
        throw new Error("Failed to fetch interviews")
      }
      const data = await response.json()
      setInterviews(data)
    } catch (error) {
      setError("Failed to load interviews")
      console.error("Error fetching interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (interviewId: string, status: "shortlisted" | "rejected") => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success(`Candidate ${status} successfully`)
      fetchInterviews() // Refresh the list
    } catch (error) {
      toast.error("Failed to update status")
      console.error("Error updating status:", error)
    }
  }

  const fetchFeedback = async (interviewId: string) => {
    setLoadingFeedback(true)
    try {
      const response = await fetch(`/api/interviews/${interviewId}/feedback`)
      if (!response.ok) {
        throw new Error("Failed to fetch feedback")
      }
      const data = await response.json()
      setFeedback(data)
    } catch (err) {
      console.error("Error fetching feedback:", err)
      setFeedback(null)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handleViewDetails = (interviewId: string) => {
    setSelectedInterview(interviewId)
    fetchFeedback(interviewId)
  }

  const handleCloseDialog = () => {
    setSelectedInterview(null)
    setFeedback(null)
  }

  const getRecommendationColor = (recommendation: string) => {
    if (!recommendation) return "text-gray-500"
    const lowerRec = recommendation.toLowerCase()
    if (lowerRec.includes("yes") || lowerRec.includes("hire")) return "text-green-500"
    if (lowerRec.includes("no")) return "text-red-500"
    return "text-gray-500"
  }

  const formatRecommendation = (recommendation: string) => {
    return recommendation.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ")
  }

  const filteredInterviews = interviews.filter((interview) => {
    const candidateEmail = interview.candidateEmail || "";
    const positionTitle = interview.position?.title || "";

    const matchesSearch = 
      candidateEmail.toLowerCase().includes(searchInput.toLowerCase()) ||
      positionTitle.toLowerCase().includes(searchInput.toLowerCase());

    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Interview["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "shortlisted":
        return "default"
      case "rejected":
        return "destructive"
      case "pending":
        return "default"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CompanyDashboardHeader />
        <div className="flex flex-1">
          <CompanyDashboardSidebar />
          <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CompanyDashboardHeader />
      <div className="flex flex-1">
        <CompanyDashboardSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Interviews</h1>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or position"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">Candidate Email</th>
                  <th className="p-4 text-left">Position</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Score</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr key={interview._id} className="border-b">
                    <td className="p-4">{interview.candidateEmail}</td>
                    <td className="p-4">{interview.position.title}</td>
                    <td className="p-4">
                      <Badge
                        variant={getStatusColor(interview.status)}
                      >
                        {interview.status}
                      </Badge>
                    </td>
                    <td className="p-4">{new Date(interview.date).toLocaleDateString()}</td>
                    <td className="p-4">{interview.score || "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {interview.status === "completed" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(interview._id, "shortlisted")}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(interview._id, "rejected")}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(interview._id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Dialog open={selectedInterview !== null} onOpenChange={handleCloseDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Interview Feedback</DialogTitle>
              </DialogHeader>
              {loadingFeedback ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : feedback?.feedback ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Ratings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">English Communication</span>
                        <span>{feedback.feedback.rating.englishCommunication}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Confidence</span>
                        <span>{feedback.feedback.rating.confidence}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Storytelling</span>
                        <span>{feedback.feedback.rating.storytelling}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Customer Handling</span>
                        <span>{feedback.feedback.rating.customerHandling}/100</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feedback.feedback.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recommendation</h4>
                    <div className={`text-lg font-semibold ${getRecommendationColor(feedback.feedback.recommendation)}`}>
                      {feedback.feedback.recommendation}
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{feedback.feedback.recommendationMsg}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No feedback available for this interview
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

