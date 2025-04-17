"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Mic, PhoneCall, AlertCircle, Clock, Video, VideoOff, MicOff } from "lucide-react"
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

const VAPI_KEY = process.env.NEXT_PUBLIC_VAPI_KEY

export default function InterviewSession() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingState, setLoadingState] = useState<'initializing' | 'starting' | 'ready' | null>(null)
  const vapiRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
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
        
        if (!VAPI_KEY) {
          throw new Error("VAPI key is not configured. Please check your environment variables.")
        }

        // Clean up existing instance if it exists
        if (vapiRef.current) {
          console.log("Cleaning up existing VAPI instance")
          vapiRef.current.removeAllListeners()
          await vapiRef.current.stop()
          vapiRef.current = null
        }

        // Create new VAPI instance
        console.log("Creating new VAPI instance")
        vapiRef.current = new Vapi(VAPI_KEY)

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
            // Validate interview data before scoring
            if (!params.id) {
              throw new Error("Interview ID is missing")
            }

            // Get the latest interview state
            const currentInterview = interview
            console.log("Current interview state:", {
              answers: currentInterview.answers,
              answerCount: currentInterview.answers.length,
              transcript: currentInterview.transcript
            })

            // If we have a transcript but it's not in answers yet, add it
            if (currentInterview.transcript && !currentInterview.isEnded) {
              setInterview(prev => {
                const newAnswers = [
                  ...prev.answers,
                  {
                    question: prev.currentQuestion,
                    answer: prev.transcript,
                    score: 0,
                    feedback: ""
                  }
                ]
                return {
                  ...prev,
                  answers: newAnswers,
                  transcript: ""
                }
              })
            }

            // Wait a moment for state to update
            await new Promise(resolve => setTimeout(resolve, 100))

            // Get the updated interview state
            const updatedInterview = interview
            console.log("Updated interview state:", {
              answers: updatedInterview.answers,
              answerCount: updatedInterview.answers.length
            })

            if (!updatedInterview.answers || updatedInterview.answers.length === 0) {
              throw new Error("No interview answers found to score")
            }

            console.log("Submitting interview answers for scoring:", {
              interviewId: params.id,
              answerCount: updatedInterview.answers.length,
              answers: updatedInterview.answers
            })

            // Submit answers for scoring
            const response = await fetch("/api/interviews/score", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                interviewId: params.id,
                answers: updatedInterview.answers
              })
            })

            if (!response.ok) {
              const errorData = await response.json()
              console.error("Interview scoring error:", {
                status: response.status,
                error: errorData,
                interviewId: params.id
              })

              if (response.status === 404) {
                throw new Error("Interview not found. Please contact support if this issue persists.")
              } else if (response.status === 400) {
                throw new Error("Invalid interview data. Please try again.")
              } else if (response.status === 401) {
                throw new Error("You are not authorized to score this interview.")
              } else {
                throw new Error(errorData.error || "Failed to process interview scoring")
              }
            }

            const result = await response.json()
            console.log("Interview scoring result:", {
              score: result.score,
              hasFeedback: !!result.feedback
            })

            setInterview(prev => ({
              ...prev,
              score: result.score,
              feedback: result.feedback
            }))

            toast.success("Interview completed successfully!")
          } catch (error) {
            console.error("Error processing interview scoring:", {
              error,
              interviewId: params.id,
              answerCount: interview.answers?.length,
              transcript: interview.transcript,
              isEnded: interview.isEnded
            })
            
            const errorMessage = error instanceof Error 
              ? error.message 
              : "Failed to process interview results"
            
            toast.error(errorMessage)
            setError(errorMessage)
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
          console.error("VAPI error event details:", {
            error,
            errorType: typeof error,
            errorString: String(error),
            errorJSON: JSON.stringify(error),
            timestamp: new Date().toISOString(),
            vapiState: {
              isStarted: vapiRef.current?.isStarted,
              isEnded: vapiRef.current?.isEnded,
              isRecording: vapiRef.current?.isRecording
            }
          })

          // Extract error message with fallbacks
          let errorMessage = "An error occurred during the interview"
          if (error) {
            if (typeof error === 'string') {
              errorMessage = error
            } else if (error.message) {
              errorMessage = error.message
            } else if (error.toString && error.toString() !== '[object Object]') {
              errorMessage = error.toString()
            }
          }

          // Show error to user
          toast.error(errorMessage)
          setError(errorMessage)
          setLoadingState(null)
          setIsLoading(false)
          
          // Only stop VAPI if it's a critical error
          if (error?.action !== 'camera-error') {
            if (vapiRef.current) {
              try {
                console.log("Attempting to stop VAPI after error...")
                vapiRef.current.stop()
                console.log("VAPI stopped successfully after error")
              } catch (stopError) {
                console.error("Error stopping VAPI after error:", {
                  stopError,
                  stopErrorType: typeof stopError,
                  stopErrorString: String(stopError)
                })
              }
            }
          }
        })

        console.log("VAPI initialization completed")
        setLoadingState('ready')
        setError(null)
      } catch (error) {
        console.error("Error initializing VAPI:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize interview system"
        setError(errorMessage)
        toast.error(errorMessage)
        setLoadingState(null)
      }
    }

    initializeVapi()

    // Cleanup function
    return () => {
      if (vapiRef.current) {
        console.log("Cleaning up VAPI instance")
        try {
          vapiRef.current.removeAllListeners()
          vapiRef.current.stop()
        } catch (error) {
          console.error("Error during VAPI cleanup:", error)
        }
      }
    }
  }, [session, router, params.id])

  // Initialize camera when interview starts
  useEffect(() => {
    if (interview.isStarted && isVideoOn) {
      const initializeCamera = async () => {
        try {
          // Request camera permissions first
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: isMicOn 
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }

          // Initialize MediaRecorder
          mediaRecorderRef.current = new MediaRecorder(stream)
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              const formData = new FormData()
              formData.append('recording', new Blob([event.data], { type: 'video/webm' }))
              formData.append('interviewId', params.id as string)
              
              fetch('/api/interview/upload-recording', {
                method: 'POST',
                body: formData
              })
              .then(response => response.json())
              .then(data => {
                console.log('Recording uploaded:', data)
              })
              .catch(error => {
                console.error('Error uploading recording:', error)
              })
            }
          }

          // Start recording
          mediaRecorderRef.current.start(1000) // Collect data every second
          
        } catch (error) {
          console.error("Error accessing camera:", error)
          setIsVideoOn(false)
          
          // Handle specific permission errors
          if (error instanceof Error && error.name === 'NotAllowedError') {
            toast.error("Camera access denied. Continuing without video recording.")
            // Continue without video but keep the interview going
            setInterview(prev => ({ ...prev, isStarted: true }))
            // Start VAPI call if not already started
            if (vapiRef.current && !vapiRef.current.isStarted) {
              startVapiCall()
            }
          } else {
            toast.error("Failed to access camera. Please check your device settings.")
          }
        }
      }

      initializeCamera()
    }
  }, [interview.isStarted, isVideoOn, isMicOn, params.id])

  // Start VAPI call when interview data is ready
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

  useEffect(() => {
    if (interview.isStarted) {
      startVapiCall()
    }
  }, [interview.isStarted, interviewData, session, params.id])

  // Handle interview answers
  useEffect(() => {
    if (interview.transcript && !interview.isEnded) {
      console.log("New transcript received:", interview.transcript)
      setInterview(prev => {
        const newAnswers = [
          ...prev.answers,
          {
            question: prev.currentQuestion,
            answer: prev.transcript,
            score: 0,
            feedback: ""
          }
        ]
        console.log("Updated answers:", newAnswers)
        return {
          ...prev,
          answers: newAnswers,
          transcript: "" // Clear transcript after adding to answers
        }
      })
    }
  }, [interview.transcript, interview.isEnded])

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
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="bg-zinc-900 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">AI Interview Session</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <span className="text-xl font-mono">{formatTime(timer)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {!interviewData ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <p className="text-gray-400">Loading interview details...</p>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8">
              <Card className="p-6 flex flex-col items-center justify-center min-h-[400px] bg-gray-900 border-gray-800">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=ai-recruiter" alt="AI Recruiter" />
                  <AvatarFallback>
                    <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                      AI
                    </div>
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-medium mb-2 text-white">AI Recruiter</h2>
                <p className="text-gray-400 text-center">
                  {interview.currentQuestion || "Ready to start your interview"}
                </p>
              </Card>

              <Card className="p-6 flex flex-col items-center justify-center min-h-[600px] bg-gray-900 border-gray-800">
                <div className="w-full h-500 mb-4 rounded-lg overflow-hidden bg-black">
                  {isVideoOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted={!isMicOn}
                      className="w-[600px] h-[400px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoOff className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-medium mb-2 text-white">{session.user.name || "Candidate"}</h2>
                <p className="text-gray-400 text-center">
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
                    className="px-8 bg-[#229799] hover:bg-[#229799]/90"
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
                    variant="outline"
                    size="icon"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full w-12 h-12"
                  >
                    {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className="rounded-full w-12 h-12"
                  >
                    {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
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

            <div className="text-center mt-4 text-gray-400">
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
          <Card className="p-4 bg-gray-900 border-gray-800">
            <p className="text-sm text-gray-400">
              {loadingState === 'initializing' && "Loading..."}
              {loadingState === 'starting' && "Starting..."}
              {loadingState === 'ready' && !interview.isStarted && "Ready to Begin"}
              {interview.isStarted && "Interview Active"}
            </p>
          </Card>
        </div>

        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="bg-gray-900 border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Exit Interview?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                {interview.isStarted 
                  ? "Are you sure you want to end this interview? This action cannot be undone, and your progress will be saved."
                  : "Are you sure you want to exit? You can return to this interview later."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">Cancel</AlertDialogCancel>
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