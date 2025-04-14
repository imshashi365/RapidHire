"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ArrowLeft, Download, Share2, Video, Play, Star } from "lucide-react"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"

// Mock results data
const resultsData = {
  overallScore: 87,
  categories: [
    { name: "Technical Knowledge", score: 92 },
    { name: "Communication", score: 85 },
    { name: "Problem Solving", score: 88 },
    { name: "Cultural Fit", score: 83 },
  ],
  questions: [
    {
      question: "Tell me about your experience with React and Next.js.",
      answer:
        "I've been working with React for over 3 years and Next.js for about 2 years. I've built several production applications using these technologies, including e-commerce platforms and content management systems. I particularly appreciate Next.js for its server-side rendering capabilities and simplified routing system.",
      feedback: "Strong technical knowledge demonstrated. Good articulation of specific experience.",
      score: 90,
    },
    {
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      answer:
        "I worked on a real-time dashboard that needed to process large amounts of data. We faced performance issues initially. I implemented data virtualization and optimized our Redux store structure to improve performance by 70%.",
      feedback:
        "Good example provided with specific metrics. Could have elaborated more on the technical details of the solution.",
      score: 85,
    },
    {
      question: "How do you approach debugging complex issues in your code?",
      answer:
        "I start by reproducing the issue consistently. Then I use browser dev tools, logging, and sometimes time-travel debugging with Redux DevTools. I isolate components to identify where the problem occurs, and I'm not afraid to ask for help when needed.",
      feedback: "Methodical approach described. Good mention of specific tools and collaborative mindset.",
      score: 88,
    },
    {
      question: "What's your experience with state management libraries?",
      answer:
        "I've used Redux extensively, and also have experience with Context API, Zustand, and Recoil. Each has its strengths - Redux for complex global state, Context for simpler apps, and Zustand for its simplicity and performance.",
      feedback: "Comprehensive knowledge of multiple state management solutions. Good comparison of use cases.",
      score: 92,
    },
    {
      question: "How do you stay updated with the latest web development trends?",
      answer:
        "I follow several tech blogs like CSS-Tricks and Smashing Magazine, subscribe to newsletters like JavaScript Weekly, and participate in online communities. I also build small projects to experiment with new technologies.",
      feedback: "Shows commitment to continuous learning. Mentioned specific resources and practical application.",
      score: 80,
    },
  ],
  strengths: [
    "Strong technical knowledge of React and related technologies",
    "Clear communication with good examples",
    "Methodical problem-solving approach",
  ],
  improvements: [
    "Could provide more detailed technical explanations",
    "Sometimes speaks too quickly when discussing complex topics",
    "Could improve eye contact during responses",
  ],
  nextSteps: [
    "Your interview has been sent to TechCorp Inc. for review",
    "You'll receive feedback within 3-5 business days",
    "You can view your interview recording and detailed analysis anytime",
  ],
  position: "Frontend Developer",
  company: "TechCorp Inc.",
  date: "April 7, 2025",
  duration: "14:25",
}

export default function InterviewSuccessPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading results
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Analyzing your interview results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Interview Completed</h1>
              <p className="text-gray-500">
                {resultsData.position} Position at {resultsData.company}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/candidate/interviews">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Interviews
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-green-50 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Interview Successfully Completed</h3>
                <p className="text-sm text-green-700">
                  Congratulations! You've completed your interview for the {resultsData.position} position.
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Your interview score and performance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50">
                  <div className="text-5xl font-bold text-primary mb-2">{resultsData.overallScore}</div>
                  <p className="text-sm text-gray-500">Overall Score</p>
                  <div className="w-full mt-4">
                    <Progress value={resultsData.overallScore} className="h-2" />
                  </div>
                  <div className="flex items-center gap-1 mt-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(resultsData.overallScore / 20)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {resultsData.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm font-medium">{category.score}/100</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-lg border overflow-hidden">
                <div className="relative bg-slate-100 h-48 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                  <Button
                    size="icon"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full h-14 w-14"
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {resultsData.duration}
                  </div>
                </div>
                <div className="p-3 bg-white border-t flex justify-between items-center">
                  <span className="text-sm text-gray-500">Interview Recording</span>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultsData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultsData.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full border border-amber-500 flex items-center justify-center mt-0.5">
                        <span className="text-amber-500 text-xs">!</span>
                      </div>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>Detailed feedback for each interview question</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="q1" className="w-full">
                <TabsList className="grid grid-cols-5 mb-4">
                  {resultsData.questions.map((_, index) => (
                    <TabsTrigger key={index} value={`q${index + 1}`}>
                      Q{index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {resultsData.questions.map((q, index) => (
                  <TabsContent key={index} value={`q${index + 1}`} className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Question {index + 1}</h3>
                      <p className="text-gray-700">{q.question}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Your Answer</h3>
                      <div className="p-4 rounded-lg border bg-slate-50">
                        <p className="text-gray-700">{q.answer}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Score</h3>
                        <span className="font-medium">{q.score}/100</span>
                      </div>
                      <Progress value={q.score} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Feedback</h3>
                      <p className="text-gray-700">{q.feedback}</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resultsData.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge className="mt-0.5">{index + 1}</Badge>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="border-t">
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  This analysis was generated by AI based on your interview responses
                </p>
                <Link href="/dashboard/candidate/interviews">
                  <Button>Return to Dashboard</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}

