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
  const [candidateName, setCandidateName] = useState<string>("") 
  const [showNameForm, setShowNameForm] = useState<boolean>(true)
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
      if (!params.id || !params.token) {
        console.error("Missing required parameters: id or token");
        toast.error("Invalid interview session parameters.");
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching interview data for token: ${params.token}, id: ${params.id}`);
        
        // Set a timeout to handle potential long-running requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          const response = await fetch(`/api/interview/public/${params.token}/session/${params.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${params.token}`,
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId); // Clear the timeout if the request completes

          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            try {
              if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                errorMessage = errorData.error || errorMessage;
              } else {
                const textError = await response.text();
                console.error("Non-JSON error response from server:", textError);
              }
            } catch (parseError) {
              console.error("Error parsing error response:", parseError);
            }
            
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log("Fetched interview data:", data);
          
          if (!data || !data.success) {
            console.error("Invalid data format received:", data);
            throw new Error("Invalid response format from server");
          }
          
          if (!data.interview) {
            console.error("No interview data in response:", data);
            throw new Error("No interview data received from server");
          }
          
          // Ensure we have the position data in the expected format
          const interviewData = {
            ...data,
            interview: {
              ...data.interview,
              position: data.interview.position || {
                title: "Interview Position",
                questions: []
              }
            }
          };
          
          setInterviewData(interviewData);
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw fetchError;
        }
      } catch (error: any) {
        console.error("Error fetching interview data:", error);
        toast.error(error.message || "Failed to fetch interview details. Please try again later.");
        setError(error.message || "Failed to load interview session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewData();
  }, [params.id, params.token]);

  // Initialize VAPI
  useEffect(() => {
    // For public interviews, we don't require a session
    // This allows anyone to participate without login
    
    const initializeVapi = async () => {
      console.log("Starting VAPI initialization...");
      try {
        setLoadingState('initializing')
        
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
        console.log("Creating new VAPI instance with key:", VAPI_KEY ? "[Key available]" : "[Key missing]");
        vapiRef.current = new Vapi(VAPI_KEY)
        console.log("VAPI instance created:", !!vapiRef.current);
        
        setLoadingState('ready')
        console.log("VAPI initialized successfully")
        
        // If interview is already marked as started, call startVapiCall
        if (interview.isStarted) {
          console.log("Interview already marked as started, calling startVapiCall");
          startVapiCall();
        }

        // Set up event listeners
        vapiRef.current.on("call-start", () => {
          console.log("Call started successfully")
          setInterview(prev => ({ ...prev, isStarted: true }))
          setLoadingState(null)
        })

        vapiRef.current.on("call-end", async () => {
          console.log("Call ended")
          
          // Only end the interview if there's meaningful conversation (more than just the initial greeting)
          if (interview.messages.length > 1) {
            try {
              setInterview(prev => ({ ...prev, isEnded: true }))
              
              // Save conversation and generate feedback
              await saveConversation()
              
              // Redirect to success page
              if (params.id && params.token) {
                // Show success message
                toast.success('Interview completed! Redirecting to results page...')
                
                // Redirect to success page after a short delay with the interview ID
                setTimeout(() => {
                  router.push(`/interview/public/success?interviewId=${params.id}`)
                }, 2000)
              }
            } catch (error) {
              console.error("Error completing interview:", error)
              toast.error("An error occurred while completing the interview.")
            }
          } else {
            toast.warning("No meaningful conversation recorded. The interview will restart.")
            // Reset the interview state to allow restarting
            setInterview(prev => ({ 
              ...prev, 
              isEnded: false,
              isStarted: false
            }))
            
            
            // Restart VAPI if needed
            if (vapiRef.current) {
              try {
                await initializeVapi()
              } catch (error) {
                console.error("Error restarting VAPI:", error)
                toast.error("Failed to restart the interview. Please refresh the page.")
              }
            }
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

          // Create a safe error object with proper typing
          const safeError = {
            message: error?.message || String(error),
            code: error?.code || (error as any)?.errorCode || "UNKNOWN",
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
          
          try {
            // Store the entire conversation when an error occurs
            const currentConversation = JSON.parse(JSON.stringify(interview.messages))
            console.log("Current conversation at error time:", {
              messageCount: currentConversation.length,
              messages: currentConversation
            })
            
            // If we have conversation data, save it to ensure it's not lost
            if (currentConversation.length > 0) {
              console.log("Attempting to save conversation data after error")
              // Save conversation data asynchronously
              saveConversationData(currentConversation).catch(saveError => {
                console.error("Error saving conversation after VAPI error:", saveError)
              })
            } else {
              console.log("No conversation data to save after error")
            }
          } catch (convError) {
            console.error("Error processing conversation during error handling:", convError)
          }

          // Handle different error types
          if (error && typeof error === 'object') {
            const errorMessage = (error as any).message || String(error);
            const errorAction = (error as any).action;
            
            if (errorMessage.includes("Meeting has ended")) {
              console.log("Meeting ended normally")
              setInterview(prev => ({ ...prev, isEnded: true }))
              // Don't show error toast for normal meeting end
              return
            }

            if (errorAction === "camera-error") {
              console.warn("Camera error occurred:", errorMessage)
              toast.warning("Camera access issue. Please check your camera permissions.")
              return
            }

            // Show error to user only for unexpected errors
            if (!errorMessage.includes("Meeting has ended")) {
              toast.error(errorMessage || "Unknown error occurred")
              setError(errorMessage || "Unknown error occurred")
            }
          } else {
            // Handle case where error is not an object
            const errorMessage = String(error);
            toast.error(errorMessage || "Unknown error occurred")
            setError(errorMessage || "Unknown error occurred")
          }
          
          setLoadingState(null)
          setIsLoading(false)
          
          // Only stop VAPI if it's a critical error
          const errorAction = error && typeof error === 'object' ? (error as any).action : undefined;
          const errorMessage = error && typeof error === 'object' ? (error as any).message : String(error);
          if (errorAction !== 'camera-error' && !errorMessage?.includes("Meeting has ended")) {
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
  }, [router, params.id])

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
    console.log("startVapiCall called with:", { 
      hasInterviewData: !!interviewData, 
      hasVapiRef: !!vapiRef.current,
      interviewStarted: interview.isStarted
    });
    
    if (!interviewData || !vapiRef.current) {
      console.error("Cannot start VAPI call: missing interview data or VAPI reference");
      toast.error("Cannot start interview: missing required data");
      return
    }

    try {
      setIsLoading(true)
      setLoadingState('starting')
      setError(null)

      // Extract position data from the interview
      const interviewDetails = interviewData.interview || {}
      const position = interviewDetails.position || {}
      
      // Get position details
      const positionTitle = position.title || interviewDetails.title || "Open Position"
      const jobDescription = position.description || interviewDetails.description || ""
      const requirements = position.requirements || interviewDetails.requirements || []
      
      // Format requirements as a string
      const requirementsText = Array.isArray(requirements) 
        ? requirements.join('\n') 
        : typeof requirements === 'string' 
          ? requirements 
          : ""
      
      // Get questions from position data and handle both string and array formats
      const questions = position.questions || interviewDetails.questions || []
      const questionList = Array.isArray(questions) 
        ? questions.map((q, i) => `${i+1}. ${q}`).join('\n')
        : typeof questions === 'string' 
          ? questions 
          : ""
      
      console.log("Position details:", {
        title: positionTitle,
        hasDescription: !!jobDescription,
        requirementsCount: Array.isArray(requirements) ? requirements.length : 'N/A',
        questionsCount: Array.isArray(questions) ? questions.length : 'N/A'
      })
      
      const callConfig = {
        name: "AI Recruiter",
        firstMessage: `Hello ${candidateName || session?.user?.name || "Candidate"}, I'm your AI interviewer for the ${positionTitle} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin!`,
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
                
                Position: ${positionTitle}
                ${jobDescription ? `Job Description: ${jobDescription}\n` : ''}
                ${requirementsText ? `Requirements:\n${requirementsText}\n` : ''}
                
                Begin the conversation with a friendly introduction, setting a relaxed yet professional tone.
                Ask one question at a time and wait for the candidate's response before proceeding.
                Keep the questions clear and concise.
                
                Questions to ask:\n${questionList}
                
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
          positionTitle: positionTitle,
          userId: session?.user?.id || "public-user"
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
    console.log("Interview state changed:", { isStarted: interview.isStarted, hasVapiRef: !!vapiRef.current });
    if (interview.isStarted && vapiRef.current) {
      console.log("Starting VAPI call due to interview.isStarted change");
      startVapiCall()
    }
  }, [interview.isStarted])

  // Helper functions
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    // Hide the form and proceed to interview
    setShowNameForm(false);
    console.log("Candidate name submitted:", candidateName);
    toast.success("Name submitted successfully");
  };

  const startInterview = () => {
    console.log("Starting interview with data:", interviewData);
    if (!interviewData?.interview) {
      toast.error("Interview data is not ready yet")
      return
    }
    try {
      // Set the interview as started
      setInterview(prev => ({ ...prev, isStarted: true }))
      toast.success("Interview started successfully")
      console.log("Interview started successfully with candidate name:", candidateName);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview. Please try again.");
    }
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
        router.push(`/interview/public/success?interviewId=${params.id}`)
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
        // Create message object with timestamp
        const assistantMessage = {
          role: 'assistant' as const,
          content: message.content,
          timestamp: new Date().toISOString()
        }
        
        // Log in the format shown in the example
        console.log("Assistant message:", assistantMessage)
        
        // Update state with the new message
        setInterview(prev => {
          const updatedMessages = [...prev.messages, assistantMessage];
          console.log("Updated messages array after assistant message:", updatedMessages);
          return {
            ...prev,
            messages: updatedMessages
          };
        })
        
        // Save conversation after each message with a delay to ensure state is updated
        setTimeout(() => {
          saveConversation()
        }, 500)
      } else if (message.type === "transcript") {
        // Only process final transcripts to avoid duplicates
        if (message.transcriptType === "final") {
          // Create user message object with timestamp
          const userMessage = {
            role: 'user' as const,
            content: message.transcript,
            timestamp: new Date().toISOString()
          }
          
          // Log in the format shown in the example
          console.log("User transcript:", userMessage)
          
          // Update state with the new message
          setInterview(prev => {
            const updatedMessages = [...prev.messages, userMessage];
            console.log("Updated messages array after user transcript:", updatedMessages);
            return {
              ...prev,
              messages: updatedMessages
            };
          })
          
          // Save conversation after each message with a delay to ensure state is updated
          setTimeout(() => {
            saveConversation()
          }, 500)
        }
      }
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

  // Consolidated function to handle ending the interview
  const handleEndInterview = async () => {
    try {
      console.log("Ending interview...")
      
      // Make sure we have at least one message from each role before ending the interview
      const currentConversation = [...interview.messages];
      
      // Check if we have user messages
      const hasUserMessages = currentConversation.some(msg => msg.role === 'user');
      if (!hasUserMessages) {
        currentConversation.push({
          role: "user",
          content: "Thank you for the interview.",
          timestamp: new Date().toISOString()
        })
      }
      
      // Check if we have assistant messages
      const hasAssistantMessages = currentConversation.some(msg => msg.role === 'assistant');
      if (!hasAssistantMessages) {
        currentConversation.push({
          role: "assistant",
          content: "Thank you for participating in this interview.",
          timestamp: new Date().toISOString()
        })
      }
      console.log("Waiting for pending messages...")
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update interview state with our captured conversation and mark as ended
      setInterview(prev => ({
        ...prev,
        isEnded: true,
        messages: currentConversation
      }))
      
      // Log the conversation we're about to save
      console.log("Saving conversation with length:", currentConversation.length)
      console.log("Conversation content:", JSON.stringify(currentConversation, null, 2))
      
      // Wait a bit longer for state update to be fully processed
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save the conversation directly using the currentConversation variable
      // instead of relying on the state which might not be updated yet
      await saveConversationData(currentConversation)
      
      // Generate and save feedback using the currentConversation variable directly
      const feedbackResult = await generateFeedback(currentConversation)
      if (feedbackResult) {
        setFeedback(feedbackResult)
        
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
      }
      
      // Show success message and redirect
      toast.success('Interview completed successfully!')
      
      // Use a timeout to ensure state updates are processed before redirecting
      setTimeout(() => {
        router.push(`/interview/public/success?interviewId=${params.id}`)
      }, 1000)
    } catch (error) {
      console.error('Error ending interview:', error)
      toast.error('Failed to end interview properly')
    }
  }

  // Function to save conversation data directly using the provided conversation array
  const saveConversationData = async (conversationData: Array<{role: string, content: string, timestamp: string}>) => {
    console.log("Attempting to save conversation data directly:", 
      JSON.stringify(conversationData, null, 2))
    if (!conversationData.length) {
      console.warn("No conversation data to save")
      return null
    }

    try {
      // Format position data
      const positionData = interviewData?.interview ? {
        title: interviewData.interview?.title || interviewData.interview?.position || "Unknown Position",
        minExperience: interviewData.interview?.minExperience || 0,
        maxExperience: interviewData.interview?.maxExperience || 10,
        requirements: Array.isArray(interviewData.interview?.requirements) 
          ? interviewData.interview.requirements 
          : [],
        questions: Array.isArray(interviewData.interview?.questions) 
          ? interviewData.interview.questions 
          : []
      } : { title: "Unknown Position" };
      
      // Ensure we have at least one message from each role to prevent premature ending
      let hasUserMessage = false;
      let hasAssistantMessage = false;
      
      // Check if we have messages from both roles
      for (const msg of conversationData) {
        if (msg.role === 'user') hasUserMessage = true;
        if (msg.role === 'assistant') hasAssistantMessage = true;
        if (hasUserMessage && hasAssistantMessage) break;
      }
      
      // If we don't have at least one message from each role, add default messages
      if (!hasUserMessage) {
        conversationData.push({
          role: 'user',
          content: "Thank you for the interview.",
          timestamp: new Date().toISOString()
        });
      }
      
      if (!hasAssistantMessage) {
        conversationData.push({
          role: 'assistant',
          content: "Thank you for participating in this interview.",
          timestamp: new Date().toISOString()
        });
      }
      
      // Store both the formatted text version and the structured conversation data
      const conversationText = conversationData
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      console.log("Storing conversation with candidate name:", candidateName);
      console.log("Storing complete structured conversation data with", conversationData.length, "messages");
      
      // Use our new feedback API endpoint
      const response = await fetch(`/api/interview/public/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: params.id,
          conversation: conversationText,
          structuredConversation: conversationData, // Include structured conversation data
          position: positionData,
          candidateName: candidateName || session?.user?.name || "Anonymous Candidate"
        })
      });
      
      // Also save the structured conversation data to the interviews API
      const structuredResponse = await fetch(`/api/interviews/${params.id}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationData
        })
      });
      
      if (!response.ok || !structuredResponse.ok) {
        console.error("Error saving conversation data:", 
          response.status, await response.text(),
          structuredResponse.status, await structuredResponse.text());
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error saving conversation data:", error);
      return null;
    }
  };
  const saveConversation = async () => {
    return await saveConversationData(interview.messages)
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
    // Ensure we have at least one message or the default message
    if (conversation.length > 0) {
      try {
        if (typeof setFeedbackLoading === 'function') {
          setFeedbackLoading(true);
        }
        console.log("Generating feedback for interview with", conversation.length, "messages");
        
        // Format the conversation for the API request
        const conversationText = conversation
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
        
        console.log("Sending conversation for feedback:", conversationText);
        
        // Format position data
        const positionData = interviewData?.interview ? {
          title: interviewData.interview?.title || interviewData.interview?.position || "Unknown Position",
          minExperience: interviewData.interview?.minExperience || 0,
          maxExperience: interviewData.interview?.maxExperience || 10,
          requirements: Array.isArray(interviewData.interview?.requirements) 
            ? interviewData.interview.requirements 
            : [],
          questions: Array.isArray(interviewData.interview?.questions) 
            ? interviewData.interview.questions 
            : []
        } : { title: "Unknown Position" };
        
        console.log("Storing conversation and generating feedback with Gemini...");
        
        // Make API call to store conversation and generate feedback with Gemini
        const response = await fetch(`/api/interview/public/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interviewId: params.id,
            conversation: conversationText,
            structuredConversation: conversation, // Include the structured conversation data
            position: positionData,
            candidateName: candidateName || session?.user?.name || "Anonymous Candidate"
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response for feedback:", data);
        
        // Check if the API returned a success status
        if (data.success) {
          // Check if feedback was generated
          if (data.feedback) {
            console.log("Feedback generated successfully:", data.feedback);
            // Use a safer approach to update feedback
            if (typeof setFeedback === 'function') {
              setFeedback(data.feedback);
            }
            toast.success("Interview feedback generated successfully!");
            
            // Redirect to success page after a short delay with the interview ID
            setTimeout(() => {
              window.location.href = `/interview/public/success?interviewId=${params?.id || ''}`;
            }, 2000);
            return data.feedback;
          } else if (data.message && data.message.includes("feedback generation failed")) {
            // Feedback generation failed but conversation was stored
            console.log("Conversation stored but feedback generation failed:", data.error || "Unknown error");
            toast.warning("Your interview was saved, but we couldn't generate feedback at this time.");
            
            // Create a basic feedback object
            const basicFeedback = {
              summary: "Thank you for completing the interview. Your responses have been recorded.",
              rating: {
                technicalSkills: 5,
                communication: 5,
                problemSolving: 5,
                experience: 5
              },
              recommendation: "Maybe",
              recommendationMsg: "Your interview has been recorded for review."
            };
            
            setFeedback(basicFeedback);
            
            setTimeout(() => {
              router.push(`/interview/public/success?interviewId=${params.id}`)
            }, 2000);
            return basicFeedback;
          } else {
            // General success case with no feedback
            console.log("No feedback data received, but conversation stored");
            toast.success("Interview completed and stored successfully!");
            setTimeout(() => {
              router.push(`/interview/public/success?interviewId=${params.id}`)
            }, 2000);
            return null;
          }
        } else {
          // API returned an error
          console.error("API error:", data.error || "Unknown error");
          toast.error("There was an issue processing your interview. Please try again later.");
          setTimeout(() => {
            router.push(`/interview/public/success?interviewId=${params.id}`)
          }, 3000);
          return null;
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        toast.error('Failed to generate feedback');
        // Still redirect to success page with the interview ID
        setTimeout(() => {
          router.push(`/interview/public/success?interviewId=${params.id}`)
        }, 3000);
        return null;
      } finally {
        setFeedbackLoading(false);
      }
    } else {
      toast.warning("No conversation data available for feedback");
      // Still redirect to success page with the interview ID
      setTimeout(() => {
        router.push(`/interview/public/success?interviewId=${params.id}`)
      }, 1000);
      return null;
    }
  };

  // Consolidated VAPI event handlers
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
        
        // Save conversation after each message with a delay to ensure state is updated
        setTimeout(() => {
          saveConversation()
        }, 500)
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
        
        // Save conversation after each message with a delay to ensure state is updated
        setTimeout(() => {
          saveConversation()
        }, 500)
      }
    }

    const handleCallEnd = async () => {
      console.log("Call ended");
      // Use the consolidated interview ending function
      await handleEndInterview();
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

  // Show loading state while initializing
  if (isLoading && !interviewData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p>Please wait while we prepare your interview session.</p>
      </div>
    )
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
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
                <h2 className="text-lg font-medium mb-2 text-white">{session?.user?.name || "Candidate"}</h2>
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
                  {showNameForm ? (
                    <div className="w-full max-w-md mx-auto mb-4">
                      <form onSubmit={handleNameSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="candidateName" className="block text-sm font-medium text-white">
                            Your Name
                          </label>
                          <input
                            type="text"
                            id="candidateName"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#229799] focus:border-[#229799] text-black"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-[#229799] hover:bg-[#229799]/90"
                          disabled={isLoading}
                        >
                          Continue to Interview
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      variant="default"
                      className="px-8 bg-[#229799] hover:bg-[#229799]/90"
                      onClick={startInterview}
                      disabled={isLoading || loadingState === 'starting' || !interviewData?.interview}
                    >
                      {isLoading ? "Starting..." : "Start Interview"}
                    </Button>
                  )}
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
                (interviewData && interviewData.interview
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