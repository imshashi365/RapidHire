export interface Position {
  _id: string
  title: string
  department?: string
  companyName?: string
  requirements: string[]
  description?: string
  salary?: {
    min: number
    max: number
    currency: string
  }
  location?: string
  type?: string
  experience?: string
}

export type InterviewStatus = "pending" | "scheduled" | "in-progress" | "completed" | "cancelled"

export interface Interview {
  _id: string
  positionId: string
  userId: string
  candidateId: string
  status: InterviewStatus
  date: Date | null
  lastDate: Date | null
  isStarted: boolean
  startedAt: Date | null
  completedAt: Date | null
  transcript: string
  questionNumber: number
  currentQuestion: string | null
  aiResponse: string | null
  score: number | null
  feedback: string
  answers: {
    question: string
    answer: string
    score: number
    feedback: string
  }[]
  position: Position | string
  createdAt: Date
  updatedAt: Date
} 