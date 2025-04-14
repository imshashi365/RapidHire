"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mic, Video, VideoOff, MicOff, Loader2, Send, Clock, CheckCircle } from "lucide-react"
import { CandidateDashboardHeader } from "@/components/candidate-dashboard-header"

// Mock interview data
const interviewData = {
  id: "123",
  position: "Frontend Developer",
  company: "TechCorp Inc.",
  duration: 15, // minutes
  questions: [
    "Tell me about your experience with React and Next.js.",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you approach debugging complex issues in your code?",
    "What's your experience with state management libraries?",
    "How do you stay updated with the latest web development trends?",
  ],
  tips: [
    "Speak clearly and at a moderate pace",
    "Provide specific examples in your answers",
    "Structure your responses with a beginning, middle, and end",
    "It's okay to take a moment to think before answering",
    "Be honest about your experience and skills",
  ],
}

export default function InterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [isPreparing, setIsPreparing] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(interviewData.duration * 60) // in seconds
  const [isAnswering, setIsAnswering] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputValue, setInputValue] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Simulate loading interview data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Add initial welcome message
      setMessages([
        {
          role: "assistant",
          content: `Welcome to your interview for the ${interviewData.position} position at ${interviewData.company}. I'll be asking you a series of questions to assess your skills and experience. Are you ready to begin?`,
        },
      ])
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle timer countdown
  useEffect(() => {
    if (isStarted && !isPreparing) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // End interview when time is up
            handleEndInterview()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isStarted, isPreparing])

  // Access camera when interview starts
  useEffect(() => {
    if (isStarted && isVideoOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: isMicOn })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err)
          setIsVideoOn(false)
        })
    }
  }, [isStarted, isVideoOn, isMicOn])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = () => {
    setIsStarted(true)
    // Give 30 seconds for preparation
    setTimeout(() => {
      setIsPreparing(false)
      // Ask the first question
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: interviewData.questions[0],
        },
      ])
    }, 30000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: inputValue,
      },
    ])
    setInputValue("")
    setIsProcessing(true)

    // Simulate AI processing time
    setTimeout(() => {
      setIsProcessing(false)

      // Move to next question or end interview
      if (currentQuestion < interviewData.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        // Add AI response with next question
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: interviewData.questions[currentQuestion + 1],
          },
        ])
      } else {
        // Final response before ending
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Thank you for completing all the questions. I'll now analyze your responses and provide feedback.",
          },
        ])

        // End interview after a short delay
        setTimeout(() => {
          handleEndInterview()
        }, 3000)
      }
    }, 2000)
  }

  const handleEndInterview = () => {
    // Navigate to success page
    router.push(`/dashboard/candidate/interview/${params.id}/success`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your interview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CandidateDashboardHeader />

      <main className="flex-1 container py-6">
        {!isStarted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{interviewData.position} Interview</CardTitle>
              <CardDescription>{interviewData.company}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Interview Instructions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>This interview will take approximately {interviewData.duration} minutes</li>
                  <li>You will be asked {interviewData.questions.length} questions related to the position</li>
                  <li>Ensure your camera and microphone are working properly</li>
                  <li>Find a quiet place with good lighting and minimal distractions</li>
                  <li>Your responses will be recorded and analyzed by our AI system</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4 bg-slate-50">
                <h3 className="font-medium mb-2">Technical Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Browser compatibility: Supported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Internet connection: Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Camera and microphone: Needs permission</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStartInterview} className="w-full">
                Start Interview
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{interviewData.position}</CardTitle>
                      <CardDescription>{interviewData.company}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {isPreparing ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="rounded-full bg-primary/10 p-4 mx-auto">
                          <Clock className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Preparation Time</h2>
                        <p className="text-gray-500 max-w-md">
                          Take a moment to prepare yourself. The interview will begin in 30 seconds.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-2xl font-bold">00:30</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {message.role === "assistant" && (
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                                  <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-100"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              {message.role === "user" && (
                                <Avatar className="h-8 w-8 ml-2">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                                  <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                          {isProcessing && (
                            <div className="flex justify-start">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                                <AvatarFallback>AI</AvatarFallback>
                              </Avatar>
                              <div className="rounded-lg px-4 py-2 bg-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Type your answer here..."
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              className="min-h-[80px]"
                              disabled={isProcessing}
                            />
                            <Button
                              className="self-end"
                              onClick={handleSendMessage}
                              disabled={!inputValue.trim() || isProcessing}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="border-t p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => setIsMicOn(!isMicOn)}>
                        {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setIsVideoOn(!isVideoOn)}>
                        {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Question {currentQuestion + 1} of {interviewData.questions.length}
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4">
                    {isVideoOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted={!isMicOn}
                        className="rounded-lg bg-black w-full h-[200px] object-cover"
                      />
                    ) : (
                      <div className="rounded-lg bg-slate-100 w-full h-[200px] flex items-center justify-center">
                        <p className="text-gray-500">Camera is turned off</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Interview Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Time Remaining</span>
                        <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
                      </div>
                      <Progress value={(timeRemaining / (interviewData.duration * 60)) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Questions</h3>
                      <div className="space-y-2">
                        {interviewData.questions.map((question, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              index === currentQuestion
                                ? "bg-primary/10 border-primary/20"
                                : index < currentQuestion
                                  ? "bg-slate-50 border-slate-200"
                                  : "bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                                  index < currentQuestion
                                    ? "bg-primary text-white"
                                    : index === currentQuestion
                                      ? "border border-primary text-primary"
                                      : "border text-gray-500"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <p className="text-sm truncate">
                                {question.length > 50 ? `${question.substring(0, 50)}...` : question}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="rounded-lg border p-4 bg-slate-50">
                      <h3 className="text-sm font-medium mb-2">Tips</h3>
                      <ul className="text-xs space-y-1 text-gray-500">
                        {interviewData.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

