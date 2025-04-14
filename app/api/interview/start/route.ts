import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const INITIAL_QUESTIONS = [
  "Tell me about yourself and your background.",
  "What interests you about this position?",
  "What are your key strengths that make you suitable for this role?",
  "Can you describe a challenging project you've worked on?",
  "Where do you see yourself in five years?",
]

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { interviewId } = await req.json()
    if (!interviewId) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get the interview
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(interviewId),
      $or: [
        { userId: new ObjectId(session.user.id) },
        { candidateId: new ObjectId(session.user.id) }
      ]
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Create a new conversation
    const conversation = await db.collection("conversations").insertOne({
      interviewId: new ObjectId(interviewId),
      userId: new ObjectId(session.user.id),
      questions: INITIAL_QUESTIONS,
      currentQuestionIndex: 0,
      answers: [],
      startedAt: new Date(),
      status: "in-progress"
    })

    // Update interview status
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status: "in-progress",
          startedAt: new Date(),
          isStarted: true
        }
      }
    )

    return NextResponse.json({
      conversationId: conversation.insertedId.toString(),
      question: INITIAL_QUESTIONS[0]
    })
  } catch (error) {
    console.error("Error starting interview:", error)
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    )
  }
} 