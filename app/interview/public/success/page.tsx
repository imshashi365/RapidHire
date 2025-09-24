"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface FeedbackData {
  englishCommunication?: number
  confidence?: number
  storytelling?: number
  customerHandling?: number
  summary?: string
  strengths?: string[]
  areasForImprovement?: string[]
  recommendation?: string
  recommendationJustification?: string
}

export default function PublicInterviewSuccess() {
  const searchParams = useSearchParams()
  const interviewId = searchParams.get("interviewId")
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!interviewId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/interview/public/feedback/result?interviewId=${interviewId}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.feedback) {
            setFeedback(data.feedback)
          }
        }
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeedback()
  }, [interviewId])
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Interview Completed!</CardTitle>
          <CardDescription>
            Thank you for participating in this interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="mb-4">
              Your interview has been successfully submitted. The hiring team will review your responses.
            </p>
          </div>
          
          {loading && (
            <div className="text-center py-4">
              <p className="mb-2">Loading feedback...</p>
              <Progress value={80} className="w-full max-w-md mx-auto" />
            </div>
          )}
          
          {feedback && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Interview Feedback</h3>
              
              {feedback.summary && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-gray-700">{feedback.summary}</p>
                </div>
              )}
              
              {(feedback.englishCommunication || feedback.confidence || 
                feedback.storytelling || feedback.customerHandling) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {feedback.englishCommunication !== undefined && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">English Communication</span>
                        <span className="text-sm font-medium">{feedback.englishCommunication}/10</span>
                      </div>
                      <Progress value={feedback.englishCommunication * 10} className="h-2" />
                    </div>
                  )}
                  
                  {feedback.confidence !== undefined && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-sm font-medium">{feedback.confidence}/10</span>
                      </div>
                      <Progress value={feedback.confidence * 10} className="h-2" />
                    </div>
                  )}
                  
                  {feedback.storytelling !== undefined && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Storytelling</span>
                        <span className="text-sm font-medium">{feedback.storytelling}/10</span>
                      </div>
                      <Progress value={feedback.storytelling * 10} className="h-2" />
                    </div>
                  )}
                  
                  {feedback.customerHandling !== undefined && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Customer Handling</span>
                        <span className="text-sm font-medium">{feedback.customerHandling}/10</span>
                      </div>
                      <Progress value={feedback.customerHandling * 10} className="h-2" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Strengths</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(feedback.strengths) ? (
                        feedback.strengths.map((strength, i) => (
                          <li key={i} className="text-gray-700">{strength}</li>
                        ))
                      ) : (
                        <li className="text-gray-700">{feedback.strengths}</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Areas for Improvement</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(feedback.areasForImprovement) ? (
                        feedback.areasForImprovement.map((area, i) => (
                          <li key={i} className="text-gray-700">{area}</li>
                        ))
                      ) : (
                        <li className="text-gray-700">{feedback.areasForImprovement}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              {feedback.recommendation && (
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <h4 className="font-medium">Recommendation</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{feedback.recommendation}</p>
                  {feedback.recommendationJustification && (
                    <p className="text-gray-600 mt-2 text-sm">{feedback.recommendationJustification}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {!loading && !feedback && (
            <p className="text-sm text-gray-500 text-center">
              Detailed feedback may be provided by the hiring team later.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <Button>Return to Homepage</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
