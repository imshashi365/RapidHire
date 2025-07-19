import mongoose, { Document } from "mongoose"

interface InterviewDocument extends Document {
  updatedAt: Date;
}

const interviewSchema = new mongoose.Schema({
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "scheduled", "in-progress", "completed", "cancelled", "shortlisted", "rejected"],
    default: "pending"
  },
  date: {
    type: Date,
    default: null
  },
  lastDate: {
    type: Date,
    default: null
  },
  isStarted: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  transcript: {
    type: String,
    default: ""
  },
  questionNumber: {
    type: Number,
    default: 0
  },
  currentQuestion: {
    type: String,
    default: null
  },
  aiResponse: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ""
  },
  answers: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    feedback: {
      type: String,
      required: true
    }
  }],
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
    required: true
  },
  conversation: [{
    role: {
      type: String,
      enum: ['assistant', 'user'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true
})

// Update the updatedAt field before saving
interviewSchema.pre<InterviewDocument>("save", function(next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Interview || mongoose.model<InterviewDocument>("Interview", interviewSchema)