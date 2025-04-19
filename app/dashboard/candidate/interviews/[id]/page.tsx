"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

interface InterviewFeedback {
  rating: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    experience: number;
  };
  summary: string;
  recommendation: string;
  recommendationMsg: string;
}

interface InterviewState {
  isStarted: boolean
  isEnded: boolean
  currentQuestion: string
  questionNumber: number
  transcript: string
  messages: Array<{
    role: 'assistant' | 'user'
    content: string
    timestamp: string
  }>
  isCompleted?: boolean
  feedback?: string
  score?: number
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
    messages: []
  })

  const [isRecording, setIsRecording] = useState(false)
  const [timer, setTimer] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

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
          setInterview(prev => ({ ...prev, isEnded: true }))
          
          // Wait for any pending state updates
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Get the latest conversation data
          const currentConversation = interview.messages || []
          console.log("Current conversation data:", currentConversation)
          
          if (currentConversation.length > 0) {
            try {
              // Prepare the conversation for analysis
              const conversationText = currentConversation
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n')

              console.log("Generating feedback for conversation:", conversationText)

              // Ensure we have position data
              if (!interviewData?.position) {
                console.error("No position data available")
                toast.error("Failed to generate feedback: Position data missing")
                return
              }

              // Call the feedback generation API
              const response = await fetch('/api/interview/feedback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  interviewId: params.id,
                  conversation: conversationText,
                  position: interviewData.position
                })
              })

              if (!response.ok) {
                throw new Error('Failed to generate feedback')
              }

              const feedback = await response.json()
              
              // Update interview state with feedback
              setInterview(prev => ({
                ...prev,
                isCompleted: true
              }))

              // Show success message
              toast.success('Interview completed! Feedback generated.')

              // Redirect to success page after a short delay with the interview ID
              setTimeout(() => {
                router.push(`/dashboard/candidate/interview/start/success?interviewId=${params.id}`)
              }, 2000)
            } catch (error) {
              console.error('Error generating feedback:', error)
              toast.error('Failed to generate feedback')
            }
          } else {
            console.warn("No conversation data available for feedback generation")
            toast.warning("No conversation data available for feedback")
            // Still redirect to success page with the interview ID
            setTimeout(() => {
              router.push(`/dashboard/candidate/interview/start/success?interviewId=${params.id}`)
            }, 1000)
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
          // Log the raw error first
          console.log("Raw VAPI error:", error)

          // Create a safe error object with fallbacks
          const safeError = {
            message: error?.message || error?.errorMsg || "Unknown error occurred",
            code: error?.code || error?.errorCode || "UNKNOWN",
            action: error?.action || "unknown",
            timestamp: new Date().toISOString(),
            vapiState: {
              isStarted: vapiRef.current?.isStarted,
              isEnded: vapiRef.current?.isEnded,
              isRecording: vapiRef.current?.isRecording
            }
          }

          // Log the structured error
          console.error("VAPI error event details:", safeError)

          // Handle specific error types
          if (safeError.message.includes("Meeting has ended")) {
            console.log("Meeting ended normally")
            setInterview(prev => ({ ...prev, isEnded: true }))
            // Don't show error toast for normal meeting end
            return
          }

          if (safeError.action === "camera-error") {
            console.warn("Camera error occurred:", safeError.message)
            toast.warning("Camera access issue. Please check your camera permissions.")
            return
          }

          // Show error to user only for unexpected errors
          if (!safeError.message.includes("Meeting has ended")) {
            toast.error(safeError.message)
            setError(safeError.message)
          }
          
          setLoadingState(null)
          setIsLoading(false)
          
          // Only stop VAPI if it's a critical error
          if (safeError.action !== 'camera-error' && !safeError.message.includes("Meeting has ended")) {
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
          
        } catch (error) {
          console.error("Error accessing camera:", error)
          setIsVideoOn(false)
          
          // Handle specific permission errors
          if (error instanceof Error && error.name === 'NotAllowedError') {
            toast.error("Camera access denied. Continuing without video.")
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
  }, [interview.isStarted, isVideoOn, isMicOn])

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [])

  // Handle interview answers
  useEffect(() => {
    if (interview.transcript && !interview.isEnded) {
      console.log("New transcript received:", interview.transcript)
      setInterview(prev => ({
        ...prev,
        transcript: "" // Clear transcript after processing
      }))
    }
  }, [interview.transcript, interview.isEnded])

  // Start VAPI call when interview data is ready
  const startVapiCall = async () => {
    if (!interviewData || !vapiRef.current || !session?.user) {
      return
    }

    try {
      setIsLoading(true)
      setLoadingState('starting')
      setError(null)

      // Get questions from position data and handle both string and array formats
      const questions = interviewData.position?.questions || []
      const questionList = Array.isArray(questions) 
        ? questions.join('\n')
        : questions || ""

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
              content: `You are an AI voice AI Recruiter AGENT conducting interviews.
                Your job is to ask candidates provided interview questions, assess their responses.
                Begin the conversation with a friendly introduction, setting a relaxed yet professional tone.
                Ask one question at a time and wait for the candidate's response before proceeding.
                Keep the questions clear and concise.
                Questions: ${questionList}
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

  // Helper functions
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

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
        // Use VAPI's say method to end the call gracefully
        vapiRef.current.say("Thank you for your time. The interview is now complete.", true)
      } else {
        // If VAPI is not available, just redirect with the interview ID
        router.push(`/dashboard/candidate/interview/start/success?interviewId=${params.id}`)
      }
    } catch (error) {
      console.error("Error exiting interview:", error)
      toast.error("Failed to exit interview properly")
    } finally {
      setShowExitDialog(false)
    }
  }

  // Add new VAPI features
  const handleMuteToggle = () => {
    if (vapiRef.current) {
      const isMuted = vapiRef.current.isMuted()
      vapiRef.current.setMuted(!isMuted)
      setIsMicOn(!isMuted)
    }
  }

  // Handle VAPI messages
  useEffect(() => {
    if (!vapiRef.current) return

    const handleMessage = (message: any) => {
      console.log("Received VAPI message:", message)
      
      if (message.type === "assistant-message") {
        console.log("Assistant message:", {
          content: message.content,
          timestamp: new Date().toISOString()
        })
        setInterview(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: message.content,
              timestamp: new Date().toISOString()
            }
          ]
        }))
      } else if (message.type === "transcript") {
        console.log("User transcript:", {
          content: message.transcript,
          timestamp: new Date().toISOString()
        })
        setInterview(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "user",
              content: message.transcript,
              timestamp: new Date().toISOString()
            }
          ]
        }))
      }

      // Log the full conversation after each update
      setInterview(prev => {
        console.log("Current conversation state:", {
          totalMessages: prev.messages.length,
          messages: prev.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        })
        return prev
      })
    }

    vapiRef.current.on("message", handleMessage)

    return () => {
      if (vapiRef.current) {
        vapiRef.current.off("message", handleMessage)
      }
    }
  }, [])

  // Add a separate effect to log conversation changes
  useEffect(() => {
    console.log("Conversation updated:", {
      totalMessages: interview.messages.length,
      messages: interview.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    })
  }, [interview.messages])

  // Update handleEndInterview to ensure conversation is saved
  const handleEndInterview = async () => {
    try {
      if (vapiRef.current) {
        console.log("Starting interview end process")
        
        // Get current conversation state
        const currentConversation = interview.messages
        console.log("Current conversation before ending:", 
          JSON.stringify(currentConversation, null, 2))
        
        // End the VAPI call gracefully
        console.log("Stopping VAPI call")
        await vapiRef.current.stop()
        
        // Wait for any pending messages
        console.log("Waiting for pending messages...")
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update interview state
        setInterview(prev => ({ ...prev, isEnded: true }))
        
        // Save conversation if we have data
        if (currentConversation.length > 0) {
          console.log("Saving conversation with length:", currentConversation.length)
          console.log("Conversation content:", JSON.stringify(currentConversation, null, 2))
          await saveConversation()
          
          // Generate and save feedback
          const feedbackResult = await generateFeedback(currentConversation)
          if (feedbackResult) {
            await saveFeedback(feedbackResult)
          }
        } else {
          console.warn("No conversation data to save")
        }
        
        // Show success message and redirect
        toast.success('Interview completed successfully!')
        router.push(`/dashboard/candidate/interview/start/success?interviewId=${params.id}`)
      }
    } catch (error) {
      console.error('Error ending interview:', error)
      toast.error('Failed to end interview properly')
    }
  }

  // Update saveConversation to include more logging
  const saveConversation = async () => {
    console.log("Attempting to save conversation:", 
      JSON.stringify(interview.messages, null, 2))
    if (!interview.messages.length) {
      console.warn("No conversation data to save")
      return
    }

    try {
      const response = await fetch(`/api/interviews/${params.id}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: interview.messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save conversation')
      }

      console.log("Conversation saved successfully. Saved data:", 
        JSON.stringify(interview.messages, null, 2))
      toast.success('Conversation saved successfully')
    } catch (error) {
      console.error('Error saving conversation:', error)
      toast.error('Failed to save conversation')
    }
  }

  // Add volume level monitoring
  useEffect(() => {
    if (vapiRef.current) {
      vapiRef.current.on("volume-level", (volume: number) => {
        // console.log("Assistant volume level:", volume)
        // You can use this for visual feedback if needed
      })
    }
  }, [])

  const generateFeedback = async (conversation: Array<{role: string, content: string, timestamp: string}>) => {
    try {
      setFeedbackLoading(true);
      console.log("Generating feedback for interview...");
      
      if (!conversation.length) {
        console.warn("No conversation data available for feedback generation");
        toast.warning("No conversation data available for feedback");
        return null;
      }
      
      // Format the conversation for the API request
      const conversationText = conversation
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      console.log("Sending conversation for feedback:", conversationText);
      
      // Format position data
      const positionData = interviewData?.position ? {
        title: interviewData.position.title || "Unknown Position",
        minExperience: interviewData.position.minExperience || 0,
        maxExperience: interviewData.position.maxExperience || 10,
        requirements: Array.isArray(interviewData.position.requirements) 
          ? interviewData.position.requirements 
          : [],
        questions: Array.isArray(interviewData.position.questions) 
          ? interviewData.position.questions 
          : []
      } : { title: "Unknown Position" };
      
      // Make API call to generate feedback
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: params.id,
          conversation: conversationText,
          position: positionData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate feedback");
      }

      const feedbackData = await response.json();
      console.log("Feedback generated:", feedbackData);
      
      setFeedback(feedbackData.feedback);
      
      // Save feedback to database
      await saveFeedback(feedbackData.feedback);
      
      toast.success("Interview feedback generated successfully");
      return feedbackData.feedback;
      
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate interview feedback");
      return null;
    } finally {
      setFeedbackLoading(false);
    }
  };

  const saveFeedback = async (feedbackData: InterviewFeedback) => {
    try {
      const response = await fetch(`/api/interviews/${params.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackData
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save feedback");
      }
      
      console.log("Feedback saved successfully");
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Failed to save feedback to database");
    }
  };

  // Update the VAPI event handlers
  useEffect(() => {
    if (!vapiRef.current) return

    const handleMessage = (message: any) => {
      console.log("Received VAPI message:", message)
      
      if (message.type === "assistant-message") {
        console.log("Assistant message:", {
          content: message.content,
          timestamp: new Date().toISOString()
        })
        setInterview(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: message.content,
              timestamp: new Date().toISOString()
            }
          ]
        }))
      } else if (message.type === "transcript") {
        console.log("User transcript:", {
          content: message.transcript,
          timestamp: new Date().toISOString()
        })
        setInterview(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "user",
              content: message.transcript,
              timestamp: new Date().toISOString()
            }
          ]
        }))
      }
    }

    const handleCallEnd = async () => {
      console.log("Call ended");
      setInterview(prev => ({ ...prev, isEnded: true }));
      
      // Wait for any pending state updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the latest conversation data
      const currentConversation = interview.messages || [];
      console.log("Current conversation data:", currentConversation);
      
      if (currentConversation.length > 0) {
        try {
          // Generate feedback from the conversation
          const feedbackResult = await generateFeedback(currentConversation);
          
          if (feedbackResult) {
            // Update interview state with feedback
            setInterview(prev => ({
              ...prev,
              isCompleted: true,
              feedback: feedbackResult.summary,
              score: Math.round((
                feedbackResult.rating.technicalSkills + 
                feedbackResult.rating.communication + 
                feedbackResult.rating.problemSolving + 
                feedbackResult.rating.experience
              ) * 10) // Convert to a score out of 100
            }));
            
            // Show success message
            toast.success('Interview completed! Feedback generated.');
            
            // Redirect to success page after a short delay with the interview ID
            setTimeout(() => {
              router.push(`/dashboard/candidate/interview/start/success?interviewId=${params.id}`);
            }, 2000);
          }
        } catch (error) {
          console.error('Error in feedback generation process:', error);
          toast.error('Failed to process interview feedback');
        }
      } else {
        console.warn("No conversation data available for feedback generation");
        toast.warning("No conversation data available for feedback");
        // Still redirect to success page with interview ID
        setTimeout(() => {
          router.push(`/dashboard/candidate/interview/start/success?interviewId=${params.id}`);
        }, 1000);
      }
    }

    vapiRef.current.on("message", handleMessage)
    vapiRef.current.on("call-end", handleCallEnd)

    return () => {
      if (vapiRef.current) {
        vapiRef.current.off("message", handleMessage)
        vapiRef.current.off("call-end", handleCallEnd)
      }
    }
  }, [interview.messages, params.id, interviewData?.position, router])

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
                <div className="mt-4 w-full max-h-[200px] overflow-y-auto">
                  {interview.messages.map((message, index) => (
                    message.role === "assistant" && (
                      <div key={index} className="mb-2 p-2 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-300">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )
                  ))}
                </div>
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
                <div className="mt-4 w-full max-h-[200px] overflow-y-auto">
                  {interview.messages.map((message, index) => (
                    message.role === "user" && (
                      <div key={index} className="mb-2 p-2 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-300">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    )
                  ))}
                </div>
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
                    className="px-8"
                    onClick={handleEndInterview}
                    disabled={interview.isEnded}
                  >
                    End Interview
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