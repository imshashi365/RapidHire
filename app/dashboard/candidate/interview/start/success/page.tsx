"use client";

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CandidateDashboardHeader } from '@/components/candidate-dashboard-header'
import { CandidateDashboardSidebar } from '@/components/candidate-dashboard-sidebar'
import { toast } from 'sonner'

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
    overallScore: number
  }
  interviewDate?: string
}

// Separate component for the feedback content
function FeedbackContent() {
  const searchParams = useSearchParams()
  const interviewId = searchParams.get('interviewId')
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [interviewDate, setInterviewDate] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!interviewId) {
        setError('No interview ID provided')
        setLoading(false)
        return
      }

      try {
        // Fetch feedback data
        const response = await fetch(`/api/interviews/${interviewId}/feedback`)
        
        if (response.status === 401) {
          throw new Error('Please log in to view feedback')
        }
        
        if (response.status === 404) {
          throw new Error('Interview feedback not found')
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch feedback')
        }
        
        const data = await response.json()
        setFeedback(data)
        
        // Fetch interview details for date only
        const interviewResponse = await fetch(`/api/interviews/${interviewId}`)
        if (interviewResponse.ok) {
          const interviewData = await interviewResponse.json()
          setInterviewDate(interviewData.date)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load feedback'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [interviewId])

  // Format date function similar to the interviews page
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "—"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "—"
    }
  }

  const renderFeedback = () => {
    if (loading) {
      return <div className="text-center text-gray-300">Loading feedback...</div>
    }

    if (error) {
      return <div className="text-center text-gray-300">{error}</div>
    }

    if (!feedback?.feedback) {
      return <div className="text-center text-gray-300">No feedback available</div>
    }

    const { rating, summary, recommendationMsg, overallScore } = feedback.feedback
    const calculatedRating = Math.round((
      rating.technicalSkills +
      rating.communication +
      rating.problemSolving +
      rating.experience
    ) / 4)

    return (
      <div className="space-y-6">
        {/* Interview Date and Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Interview Date</h3>
            <div className="text-xl font-medium text-gray-300">
              {interviewDate ? formatDate(interviewDate) : "—"}
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Overall Score</h3>
            <div className="text-xl font-medium text-gray-300">
              {overallScore ? `${overallScore}/100` : `${calculatedRating}/100`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Overall Rating</h3>
            <div className="text-3xl font-bold text-blue-400">{overallScore || calculatedRating}/100</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Technical Skills</h3>
            <div className="text-3xl font-bold text-blue-400">{rating.technicalSkills}/100</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Communication</h3>
            <div className="text-3xl font-bold text-blue-400">{rating.communication}/100</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Problem Solving</h3>
            <div className="text-3xl font-bold text-blue-400">{rating.problemSolving}/100</div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Interview Summary</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Recommendation</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{recommendationMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Interview Completed</h1>
      {renderFeedback()}
    </div>
  )
}

// Main page component
export default function InterviewSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <CandidateDashboardHeader />
      <div className="flex">
        <CandidateDashboardSidebar />
        <main className="flex-1 p-8">
          <Suspense fallback={<div className="text-center text-gray-300">Loading...</div>}>
            <FeedbackContent />
          </Suspense>
        </main>
      </div>
    </div>
  )
} 