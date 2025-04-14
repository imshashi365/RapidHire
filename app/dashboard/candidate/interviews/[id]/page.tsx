"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Mic, PhoneCall, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import Vapi from "@vapi-ai/web"

interface InterviewState {
  isStarted: boolean
  isEnded: boolean
  currentQuestion: string
  questionNumber: number
  transcript: string
  aiResponse: string
  score: number | null
  feedback: {
    strengths: string[]
    weaknesses: string[]
    overallFeedback: string
  } | null
  answers: {
    question: string
    answer: string
    score: number
    feedback: string
  }[]
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  type: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

const assistantConfig = {
  name: "AI Recruiter",
  firstMessage: "Hi {userName}, how are you? Ready for your interview on {jobPosition}?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US"
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer"
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 150,
    messages: [
      {
        role: "system",
        content: `You are an AI voice assistant conducting interviews.
          Your job is to ask candidates provided interview questions, assess their responses.
          Begin the conversation with a friendly introduction, setting a relaxed yet professional tone.
          Ask one question at a time and wait for the candidate's response before proceeding.
          Keep the questions clear and concise.
          Questions: {questionList}
          If the candidate struggles, offer hints or rephrase the question without giving away the answer.
          Provide brief, encouraging feedback after each answer.
          Keep the conversation natural and engaging.
          After all questions, wrap up the interview smoothly by summarizing their performance.
          End on a positive note.`
      }
    ]
  }
}


export default function InterviewSession() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingState, setLoadingState] = useState<'initializing' | 'starting' | 'ready' | null>(null)
  const vapiRef = useRef<any>(null)
  const [interviewData, setInterviewData] = useState<any>(null)
  const [interview, setInterview] = useState<InterviewState>({
    isStarted: false,
    isEnded: false,
    currentQuestion: "",
    questionNumber: 0,
    transcript: "",
    aiResponse: "",
    score: null,
    feedback: null,
    answers: []
  })

  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showExitDialog, setShowExitDialog] = useState(false)

  // Fetch interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!params.id) return
      
      try {
        const response = await fetch(`/api/interviews/${params.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch interview details")
        }
        const data = await response.json()
        
        // Fetch position details if needed
        if (data.positionId && !data.position?.title) {
          const positionResponse = await fetch(`/api/positions/${data.positionId}`)
          if (positionResponse.ok) {
            const positionData = await positionResponse.json()
            data.position = positionData
          }
        }
        
        setInterviewData(data)
      } catch (error) {
        console.error("Error fetching interview data:", error)
        toast.error("Failed to fetch interview details")
      }
    }

    fetchInterviewData()
  }, [params.id])

  // Initialize VAPI
  useEffect(() => {
    if (!session?.user) {
      router.push("/login")
      return
    }

    const initializeVapi = async () => {
      try {
        setLoadingState('initializing')
        console.log("Initializing VAPI...")
        
        const vapiKey = process.env.NEXT_PUBLIC_VAPI_KEY
        console.log("VAPI Key loaded:", vapiKey ? "Key present" : "Key missing")
        
        if (!vapiKey) {
          console.error("VAPI key is missing")
          throw new Error("VAPI key is not configured")
        }

        if (!vapiRef.current) {
          console.log("Creating new VAPI instance with key:", vapiKey.substring(0, 4) + "...")
          vapiRef.current = new Vapi(vapiKey)

          // Set up event listeners
          vapiRef.current.on("call-start", () => {
            console.log("Call started successfully")
            setInterview(prev => ({ ...prev, isStarted: true }))
            setLoadingState(null)
          })

          vapiRef.current.on("call-end", async () => {
            console.log("Call ended")
            setInterview(prev => ({ ...prev, isEnded: true, isRecording: false }))
            
            try {
              // Submit answers for scoring
              const response = await fetch("/api/interviews/score", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  interviewId: params.id,
                  answers: interview.answers
                })
              })

              if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to process interview scoring")
              }

              const result = await response.json()
              setInterview(prev => ({
                ...prev,
                score: result.score,
                feedback: result.feedback
              }))

              toast.success("Interview completed successfully!")
            } catch (error) {
              console.error("Error processing interview scoring:", error)
              toast.error(error instanceof Error ? error.message : "Failed to process interview results")
            }
          })

          vapiRef.current.on("speech-start", () => {
            console.log("AI started speaking")
            setInterview(prev => ({ ...prev, isRecording: false }))
          })

          vapiRef.current.on("speech-end", () => {
            console.log("AI finished speaking")
            setInterview(prev => ({ ...prev, isRecording: true }))
          })

          vapiRef.current.on("transcript", (transcript: string) => {
            console.log("Transcript received:", transcript)
            setInterview(prev => ({
              ...prev,
              transcript
            }))
          })

          vapiRef.current.on("error", (error: any) => {
            console.error("VAPI error event:", error)
            toast.error("An error occurred during the interview")
            setLoadingState(null)
            setIsLoading(false)
          })
        }

        console.log("VAPI initialization completed")
        setLoadingState('ready')
      } catch (error) {
        console.error("Error initializing VAPI:", error)
        toast.error(error instanceof Error ? error.message : "Failed to initialize interview system")
        setLoadingState(null)
      }
    }

    initializeVapi()

    return () => {
      if (vapiRef.current) {
        console.log("Cleaning up VAPI instance")
        vapiRef.current.stop()
      }
    }
  }, [session, router])

  // Start VAPI call when interview data is ready
  useEffect(() => {
    const startVapiCall = async () => {
      if (!interviewData || !vapiRef.current || !session?.user) {
        return
      }

      try {
        setIsLoading(true)
        setLoadingState('starting')
        setError(null)

        const callConfig = {
          name: "AI Recruiter",
          firstMessage: `Hello ${session.user.name}, I'm your AI interviewer for the ${interviewData.position.title} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin!`,
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en-US"
          },
          voice: {
            provider: "playht",
            voiceId: "jennifer"
          },
          model: {
            provider: "openai",
            model: "gpt-4",
            temperature: 0.7,
            maxTokens: 150,
            messages: [
              {
                role: "system",
                content: `You are an AI voice assistant conducting interviews.
                  Your job is to ask candidates provided interview questions, assess their responses.
                  Begin the conversation with a friendly introduction, setting a relaxed yet professional tone.
                  Ask one question at a time and wait for the candidate's response before proceeding.
                  Keep the questions clear and concise.
                  Questions: ${Array.isArray(interviewData.position.questions) 
                    ? interviewData.position.questions.join("\n")
                    : "No questions available"}
                  If the candidate struggles, offer hints or rephrase the question without giving away the answer.
                  Provide brief, encouraging feedback after each answer.
                  Keep the conversation natural and engaging.
                  After all questions, wrap up the interview smoothly by summarizing their performance.
                  End on a positive note.`
              }
            ]
          },
          metadata: {
            interviewId: params.id,
            userId: session.user.id
          }
        }

        console.log("Starting VAPI call with config:", JSON.stringify(callConfig, null, 2))

        const call = await vapiRef.current.start(callConfig)
        if (!call) {
          throw new Error("Failed to initialize VAPI call")
        }

        setLoadingState(null)
      } catch (error) {
        console.error("Error in startVapiCall:", error)
        setError(error instanceof Error ? error.message : "Failed to start interview")
        setLoadingState(null)
        toast.error(error instanceof Error ? error.message : "Failed to start interview")
      } finally {
        setIsLoading(false)
      }
    }

    if (interview.isStarted) {
      startVapiCall()
    }
  }, [interview.isStarted, interviewData, session, params.id])

  const startInterview = () => {
    if (!interviewData?.position?.title) {
      toast.error("Interview data is not ready yet")
      return
    }
    setInterview(prev => ({ ...prev, isStarted: true }))
  }

  const handleExitInterview = () => {
    setShowExitDialog(true)
  }

  const confirmExit = async () => {
    try {
      if (vapiRef.current) {
        await vapiRef.current.stop()
      }
      router.push("/dashboard/candidate/interviews")
    } catch (error) {
      console.error("Error exiting interview:", error)
      toast.error("Failed to exit interview properly")
    } finally {
      setShowExitDialog(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p>Please sign in to continue...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">AI Interview Session</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <span className="text-xl font-mono">{formatTime(timer)}</span>
              </div>
              <nav className="flex items-center space-x-4">
                <Link href="/dashboard/candidate/interviews" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span>My Interviews</span>
                </Link>
                <Link href="/dashboard/candidate/profile" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span>My Profile</span>
                </Link>
                <Link href="/dashboard/candidate/resume" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span>Resume</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!interviewData ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="p-6">
              <p className="text-gray-500">Loading interview details...</p>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8">
              <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=ai-recruiter" alt="AI Recruiter" />
                  <AvatarFallback>
                    <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                      AI
                    </div>
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-medium mb-2">AI Recruiter</h2>
                <p className="text-gray-500 text-center">
                  {interview.currentQuestion || "Ready to start your interview"}
                </p>
              </Card>

              <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-medium mb-2">{session.user.name || "Candidate"}</h2>
                <p className="text-gray-500 text-center">
                  {isRecording ? "Recording..." : "Click the microphone to start"}
                </p>
              </Card>
            </div>

            <div className="flex justify-center mt-8 space-x-4">
              {!interview.isStarted ? (
                <>
                  <Button
                    size="lg"
                    variant="default"
                    className="px-8"
                    onClick={startInterview}
                    disabled={isLoading || loadingState === 'starting' || !interviewData?.position?.title}
                  >
                    {isLoading ? "Starting..." : "Start Interview"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8"
                    onClick={handleExitInterview}
                    disabled={isLoading}
                  >
                    Exit
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "secondary"}
                    className="rounded-full w-12 h-12"
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={interview.isEnded}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="rounded-full w-12 h-12"
                    onClick={handleExitInterview}
                    disabled={!interview.isStarted || interview.isEnded}
                  >
                    <PhoneCall className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            <div className="text-center mt-4 text-gray-500">
              {loadingState === 'initializing' && "Loading interview details..."}
              {loadingState === 'starting' && "Starting interview..."}
              {loadingState === 'ready' && !interview.isStarted && 
                (interviewData?.position?.title 
                  ? "Click 'Start Interview' to begin"
                  : "Waiting for interview data...")}
              {interview.isStarted && "Interview in Progress..."}
            </div>
          </>
        )}

        <div className="fixed bottom-8 right-8">
          <Card className="p-4">
            <p className="text-sm text-gray-600">
              {loadingState === 'initializing' && "Loading..."}
              {loadingState === 'starting' && "Starting..."}
              {loadingState === 'ready' && !interview.isStarted && "Ready to Begin"}
              {interview.isStarted && "Interview Active"}
            </p>
          </Card>
        </div>

        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit Interview?</AlertDialogTitle>
              <AlertDialogDescription>
                {interview.isStarted 
                  ? "Are you sure you want to end this interview? This action cannot be undone, and your progress will be saved."
                  : "Are you sure you want to exit? You can return to this interview later."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmExit} className="bg-red-500 hover:bg-red-600">
                {interview.isStarted ? "End Interview" : "Exit"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
} 