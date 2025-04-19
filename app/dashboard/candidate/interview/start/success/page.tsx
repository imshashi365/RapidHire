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
    overallScore?: number
  }
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
        
        // Fetch interview details for date
        const interviewResponse = await fetch(`/api/interviews/${interviewId}`)
        if (interviewResponse.ok) {
          const interviewData = await interviewResponse.json()
          console.log('Interview data:', interviewData)
          // Set the interview date from the response
          if (interviewData.completedAt) {
            console.log('Using completedAt:', interviewData.completedAt)
            setInterviewDate(interviewData.completedAt)
          } else if (interviewData.date) {
            console.log('Using date:', interviewData.date)
            setInterviewDate(interviewData.date)
          } else if (interviewData.createdAt) {
            console.log('Using createdAt:', interviewData.createdAt)
            setInterviewDate(interviewData.createdAt)
          } else {
            console.log('No date found in interview data')
          }
        } else {
          console.error('Failed to fetch interview details:', interviewResponse.status)
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

  // Calculate overall rating using weighted average (fallback if overallScore is not available)
  const calculateOverallRating = (feedback: InterviewFeedback) => {
    // If overallScore is available, use it
    if (feedback.feedback.overallScore !== undefined) {
      return feedback.feedback.overallScore;
    }
    
    // Otherwise calculate it using the weighted formula
    const weights = {
      technicalSkills: 0.80, // 80% weight
      communication: 0.05,    // 5% weight
      problemSolving: 0.10,  // 10% weight
      experience: 0.05       // 5% weight
    };
    
    const weightedSum = 
      feedback.feedback.rating.technicalSkills * weights.technicalSkills + 
      feedback.feedback.rating.communication * weights.communication + 
      feedback.feedback.rating.problemSolving * weights.problemSolving + 
      feedback.feedback.rating.experience * weights.experience;
    
    return Math.round(weightedSum);
  };

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

    const { rating, summary, recommendationMsg } = feedback.feedback
    
    // Define rating categories with their weights
    const ratingCategories = [
      { name: 'Technical Skills', value: rating.technicalSkills, weight: '80%', color: 'bg-blue-500' },
      { name: 'Problem Solving', value: rating.problemSolving, weight: '10%', color: 'bg-green-500' },
      { name: 'Communication', value: rating.communication, weight: '5%', color: 'bg-yellow-500' },
      { name: 'Experience', value: rating.experience, weight: '5%', color: 'bg-purple-500' }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Interview Date</h3>
            <div className="text-xl font-medium text-gray-300">
              {interviewDate ? formatDate(interviewDate) : "—"}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Rating</h3>
            <div className="text-4xl font-bold text-primary">
              {calculateOverallRating(feedback)}
            </div>
            <div className="text-sm text-gray-500 mt-1">out of 100</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          
          {ratingCategories.map((category) => (
            <div key={category.name} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                {/* <span className="text-sm text-gray-500">Weight: {category.weight}</span> */}
              </div>
              <div className="flex items-center">
                <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className={`h-2 rounded-full ${category.color}`} 
                    style={{ width: `${category.value}%` }}
                  ></div>
                  {/* <span className="text-sm text-gray-500">{category.value}</span> */}
                </div>
                <span className="text-lg font-semibold text-gray-500">{category.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Summary</h3>
          <p className="text-gray-700">{summary}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Recommendation</h3>
          <p className="text-gray-700">{recommendationMsg}</p>
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