import { ObjectId } from "mongodb"

export interface Position {
  _id?: ObjectId
  title: string
  department: string
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Internship"
  description: string
  requirements: string[]
  questions: string[]
  candidates: number
  interviews: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  companyId: ObjectId
}

export const positionSchema = {
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ["Full-time", "Part-time", "Contract", "Internship"]
  },
  description: { type: String, required: true },
  requirements: { type: [String], required: true },
  questions: { type: [String], required: true },
  candidates: { type: Number, default: 0 },
  interviews: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  companyId: { type: ObjectId, required: true }
} 