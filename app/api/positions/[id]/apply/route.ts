import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate position ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid position ID" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if position exists
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(params.id)
    })

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    // Check if user has already applied
    const existingApplication = await db.collection("applications").findOne({
      positionId: new ObjectId(params.id),
      userId: new ObjectId(session.user.id)
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this position" },
        { status: 400 }
      )
    }

    // Create application record
    const application = await db.collection("applications").insertOne({
      positionId: new ObjectId(params.id),
      userId: new ObjectId(session.user.id),
      status: "pending",
      appliedAt: new Date(),
      updatedAt: new Date()
    })

    // Create interview record
    const interview = await db.collection("interviews").insertOne({
      positionId: new ObjectId(params.id),
      userId: new ObjectId(session.user.id),
      status: "scheduled",
      isStarted: false,
      currentQuestion: "",
      questionNumber: 0,
      transcript: "",
      aiResponse: "",
      score: null,
      feedback: null,
      startedAt: "",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      message: "Application submitted successfully",
      applicationId: application.insertedId.toString(),
      interviewId: interview.insertedId.toString()
    })
  } catch (error) {
    console.error("Apply for position error:", error)
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    )
  }
} 