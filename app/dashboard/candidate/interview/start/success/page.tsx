"use client";

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CandidateDashboardHeader } from '@/components/candidate-dashboard-header'
import { CandidateDashboardSidebar } from '@/components/candidate-dashboard-sidebar'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'

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
  const [pollingCount, setPollingCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // Function to fetch feedback
  const fetchFeedback = async (isPolling = false) => {
    if (!interviewId) {
      setError('No interview ID provided')
      setLoading(false)
      return
    }

    try {
      console.log('Fetching feedback for interview ID:', interviewId)
      
      // First check if the interview exists
      const interviewCheckResponse = await fetch(`/api/interviews/${interviewId}`)
      console.log('Interview check response status:', interviewCheckResponse.status)
      
      if (!interviewCheckResponse.ok) {
        const errorData = await interviewCheckResponse.json().catch(() => ({}))
        console.error('Interview check error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch interview')
      }
      
      const interviewData = await interviewCheckResponse.json()
      console.log('Interview data:', interviewData)
      
      // Check if the interview has feedback
      if (!interviewData.feedback) {
        console.log('Interview exists but has no feedback yet')
        
        // If we're polling and haven't reached max attempts, continue polling
        if (isPolling && pollingCount < 10) {
          setPollingCount(prev => prev + 1)
          return
        }
        
        // If we've reached max polling attempts, show the message
        if (pollingCount >= 10) {
          setError('Interview feedback is still being generated. Please check back later.')
          setLoading(false)
          return
        }
        
        // If this is the first attempt, start polling
        if (!isPolling) {
          setIsPolling(true)
          setPollingCount(1)
          return
        }
      }
      
      // If we have feedback, set the date
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
      
      // Now fetch the feedback
      const response = await fetch(`/api/interviews/${interviewId}/feedback`)
      console.log('Feedback response status:', response.status)
      
      if (response.status === 401) {
        throw new Error('Please log in to view feedback')
      }
      
      if (response.status === 404) {
        throw new Error('Interview feedback not found')
      }
      
      if (response.status === 504) {
        throw new Error('The server took too long to respond. Please try again later.')
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to fetch feedback')
      }
      
      const data = await response.json()
      console.log('Feedback data:', data)
      setFeedback(data)
      setLoading(false)
      setIsPolling(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feedback'
      console.error('Error in fetchFeedback:', err)
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
      setIsPolling(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchFeedback()
  }, [interviewId])

  // Polling effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (isPolling) {
      // Poll every 3 seconds
      intervalId = setInterval(() => {
        fetchFeedback(true)
      }, 3000)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isPolling, interviewId])

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
    
    // Otherwise calculate it using the weighted formula with new weights
    const weights = {
      englishCommunication: 0.40, // 40% weight
      confidence: 0.30,          // 30% weight
      storytelling: 0.15,        // 15% weight
      customerHandling: 0.15     // 15% weight
    };
    
    const weightedSum = 
      feedback.feedback.rating.englishCommunication * weights.englishCommunication + 
      feedback.feedback.rating.confidence * weights.confidence + 
      feedback.feedback.rating.storytelling * weights.storytelling + 
      feedback.feedback.rating.customerHandling * weights.customerHandling;
    
    return Math.round(weightedSum);
  };

  const handleRetry = async () => {
    setIsRetrying(true)
    setLoading(true)
    setError(null)
    setPollingCount(0)
    
    try {
      // Try to generate feedback again
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId,
          conversation: [] // We don't have the conversation here, but the API will use fallback
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to regenerate feedback')
      }
      
      // Wait a moment for the feedback to be saved
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Then fetch the feedback
      await fetchFeedback()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate feedback'
      console.error('Error regenerating feedback:', err)
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
    } finally {
      setIsRetrying(false)
    }
  }

  const renderFeedback = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <div className="text-center text-gray-300">
            {isPolling 
              ? `Loading feedback... (Attempt ${pollingCount}/10)` 
              : "Loading feedback..."}
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-300 mb-4">{error}</div>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => {
                setLoading(true)
                setError(null)
                setPollingCount(0)
                fetchFeedback()
              }}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Retrying...
                </>
              ) : (
                'Retry'
              )}
            </button>
            
            {error.includes('too long to respond') && (
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                disabled={isRetrying}
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Regenerate Feedback
              </button>
            )}
          </div>
        </div>
      )
    }

    if (!feedback?.feedback) {
      return <div className="text-center text-gray-300">No feedback available</div>
    }

    const { rating, summary, recommendationMsg } = feedback.feedback
    
    // Define rating categories with their weights
    const ratingCategories = [
      { name: 'English Communication', value: rating.englishCommunication, weight: '40%', color: 'bg-blue-500' },
      { name: 'Confidence', value: rating.confidence, weight: '30%', color: 'bg-green-500' },
      { name: 'Storytelling', value: rating.storytelling, weight: '15%', color: 'bg-yellow-500' },
      { name: 'Customer Handling', value: rating.customerHandling, weight: '15%', color: 'bg-purple-500' }
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
                <span className="text-sm text-gray-500">Weight: {category.weight}</span>
              </div>
              <div className="flex items-center">
                <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className={`h-2 rounded-full ${category.color}`} 
                    style={{ width: `${category.value}%` }}
                  ></div>
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