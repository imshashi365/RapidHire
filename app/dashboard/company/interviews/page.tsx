"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { CompanyDashboardHeader } from "@/components/company-dashboard-header"
import { CompanyDashboardSidebar } from "@/components/company-dashboard-sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Interview {
  _id: string
  candidateName?: string
  candidateEmail?: string
  positionId: string
  position: {
    _id: string
    title: string
    companyId: string
  }
  status: "scheduled" | "completed" | "cancelled"
  date: string
  score?: number
}

interface InterviewFeedback {
  feedback: {
    rating: {
      technicalSkills: number
      communication: number
      problemSolving: number
      experience: number
    }
    summary: string
    recommendation: string
    recommendationMsg: string
  }
}

export default function InterviewsPage() {
  const { data: session } = useSession()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [loadingFeedback, setLoadingFeedback] = useState(false)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        console.log("Fetching interviews...")
        const response = await fetch("/api/company/interviews")
        console.log("Response status:", response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch interviews: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Received interviews:", data)
        
        if (!Array.isArray(data)) {
          throw new Error("Expected array of interviews but got: " + typeof data)
        }
        
        setInterviews(data)
      } catch (err) {
        console.error("Error in fetchInterviews:", err)
        setError(err instanceof Error ? err.message : "Failed to load interviews")
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [])

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

  const filteredInterviews = interviews.filter(
    (interview) => {
      const searchLower = search.toLowerCase()
      const nameMatch = interview.candidateName?.toLowerCase().includes(searchLower) || false
      const emailMatch = interview.candidateEmail?.toLowerCase().includes(searchLower) || false
      const titleMatch = interview.position?.title?.toLowerCase().includes(searchLower) || false
      return nameMatch || emailMatch || titleMatch
    }
  )

  const getStatusColor = (status: Interview["status"]) => {
    switch (status) {
      case "scheduled":
        return "secondary"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <CompanyDashboardSidebar />
        <div className="flex-1">
          <CompanyDashboardHeader />
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <CompanyDashboardSidebar />
      <div className="flex-1">
        <CompanyDashboardHeader />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Interviews</h1>
            <Input
              placeholder="Search interviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="border rounded-lg bg-zinc-900">
              <table className="min-w-full divide-y divide-gray-200 bg-zinc-900">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInterviews.map((interview) => (
                    <tr key={interview._id} className="bg-zinc-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{interview.candidateName || "N/A"}</div>
                          <div className="text-sm text-gray-500">{interview.candidateEmail || ""}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.position?.title || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.date ? new Date(interview.date).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.score ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(interview._id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                        <span className="text-gray-500">Technical Skills</span>
                        <span>{feedback.feedback.rating.technicalSkills}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Communication</span>
                        <span>{feedback.feedback.rating.communication}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Problem Solving</span>
                        <span>{feedback.feedback.rating.problemSolving}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Experience</span>
                        <span>{feedback.feedback.rating.experience}/100</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-gray-500">{feedback.feedback.summary}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recommendation</h4>
                    <div className={`text-lg font-semibold ${getRecommendationColor(feedback.feedback.recommendation)}`}>
                      {feedback.feedback.recommendation}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{feedback.feedback.recommendationMsg}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
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

