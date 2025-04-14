"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, ArrowLeft, Download, Share2 } from "lucide-react"

export default function InterviewResultsPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)

  // Mock results data
  const results = {
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
  }

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
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">AI</span>Interviewer
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/candidate">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Interview Results</h1>
              <p className="text-gray-500">Frontend Developer Position at TechCorp Inc.</p>
            </div>
            <div className="flex items-center gap-2">
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

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Your interview score and performance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-slate-50">
                  <div className="text-5xl font-bold text-primary mb-2">{results.overallScore}</div>
                  <p className="text-sm text-gray-500">Overall Score</p>
                  <div className="w-full mt-4">
                    <Progress value={results.overallScore} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  {results.categories.map((category, index) => (
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
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
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
                  {results.improvements.map((improvement, index) => (
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
                  {results.questions.map((_, index) => (
                    <TabsTrigger key={index} value={`q${index + 1}`}>
                      Q{index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {results.questions.map((q, index) => (
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
            <CardFooter className="border-t">
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  This analysis was generated by AI based on your interview responses
                </p>
                <Link href="/dashboard/candidate">
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

