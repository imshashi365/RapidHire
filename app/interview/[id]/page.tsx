"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Video, VideoOff, MicOff, Loader2 } from "lucide-react"

export default function InterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes in seconds
  const [isAnswering, setIsAnswering] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock questions
  const questions = [
    "Tell me about your experience with React and Next.js.",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you approach debugging complex issues in your code?",
    "What's your experience with state management libraries?",
    "How do you stay updated with the latest web development trends?",
  ]

  useEffect(() => {
    // Simulate loading interview data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isStarted && !isProcessing) {
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
  }, [isStarted, isProcessing])

  useEffect(() => {
    if (isStarted && isVideoOn) {
      // Access user's camera when interview starts
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
  }

  const handleNextQuestion = () => {
    setIsAnswering(false)
    setIsProcessing(true)

    // Simulate AI processing the answer
    setTimeout(() => {
      setIsProcessing(false)
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
      } else {
        handleEndInterview()
      }
    }, 3000)
  }

  const handleStartAnswering = () => {
    setIsAnswering(true)
  }

  const handleEndInterview = () => {
    // Simulate completing the interview and redirecting to results
    router.push(`/interview/${params.id}/results`)
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
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">AI</span>Interviewer
          </div>
          <div className="flex items-center gap-4">
            {isStarted && (
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600">
                  {formatTime(timeRemaining)}
                </div>
                <Progress value={(timeRemaining / 900) * 100} className="h-2 w-20" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        {!isStarted ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Frontend Developer Interview</CardTitle>
              <CardDescription>TechCorp Inc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Interview Instructions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>This interview will take approximately 15 minutes</li>
                  <li>You will be asked 5 questions related to the position</li>
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
                <CardHeader>
                  <CardTitle>
                    Question {currentQuestion + 1} of {questions.length}
                  </CardTitle>
                  <CardDescription>
                    {isProcessing ? "Processing your answer..." : "Answer the following question"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6 rounded-lg border p-4 bg-slate-50">
                    <p className="font-medium">{questions[currentQuestion]}</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    {isVideoOn ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted={!isMicOn}
                        className="rounded-lg border bg-black w-full max-h-[300px] object-cover"
                      />
                    ) : (
                      <div className="rounded-lg border bg-slate-100 w-full h-[300px] flex items-center justify-center">
                        <p className="text-gray-500">Camera is turned off</p>
                      </div>
                    )}
                  </div>

                  {isProcessing && (
                    <div className="mt-6 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <p>Processing your answer...</p>
                      </div>
                    </div>
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

                    {!isAnswering ? (
                      <Button onClick={handleStartAnswering} disabled={isProcessing}>
                        Start Answering
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion} disabled={isProcessing}>
                        {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Interview"}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Interview Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time Remaining</span>
                      <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
                    </div>
                    <Progress value={(timeRemaining / 900) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Questions</h3>
                    <div className="space-y-2">
                      {questions.map((question, index) => (
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

                  <div className="rounded-lg border p-4 bg-slate-50">
                    <h3 className="text-sm font-medium mb-2">Tips</h3>
                    <ul className="text-xs space-y-1 text-gray-500">
                      <li>Speak clearly and at a moderate pace</li>
                      <li>Provide specific examples in your answers</li>
                      <li>Structure your responses with a beginning, middle, and end</li>
                      <li>It's okay to take a moment to think before answering</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

