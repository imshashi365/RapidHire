import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log("No session or user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session user ID:", session.user.id)

    const { db } = await connectToDatabase()
    
    // Convert string ID to ObjectId
    const candidateId = new ObjectId(session.user.id)
    console.log("Looking for interviews with candidateId:", candidateId.toString())

    // First, check if the interviews collection exists
    const collections = await db.listCollections().toArray()
    console.log("Available collections:", collections.map(c => c.name))

    // Get all interviews for the current user
    const interviews = await db.collection("interviews")
      .find({ 
        candidateId: candidateId,
        status: { $ne: "cancelled" } // Exclude cancelled interviews
      })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .toArray()

    console.log("Found interviews:", interviews.length)
    console.log("Raw interviews data:", JSON.stringify(interviews, null, 2))

    // Format interviews
    const formattedInterviews = interviews.map(interview => {
      console.log("Processing interview:", interview._id.toString())
      return {
        id: interview._id.toString(),
        position: {
          title: interview.position?.title || "Unknown Position",
          department: interview.position?.department || "",
          companyName: interview.position?.companyName || "Unknown Company",
          requirements: interview.position?.requirements || [],
        },
        date: interview.date ? new Date(interview.date).toISOString() : null,
        lastDate: interview.lastDate ? new Date(interview.lastDate).toISOString() : null,
        status: interview.status || "pending",
        isStarted: interview.isStarted || false,
        startedAt: interview.startedAt || null,
        completedAt: interview.completedAt || null,
        transcript: interview.transcript || "",
        questionNumber: interview.questionNumber || 0,
        currentQuestion: interview.currentQuestion || null,
        aiResponse: interview.aiResponse || null,
        createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: interview.updatedAt ? new Date(interview.updatedAt).toISOString() : new Date().toISOString(),
      }
    })

    console.log("Formatted interviews:", formattedInterviews.length)

    return NextResponse.json(formattedInterviews)
  } catch (error) {
    console.error("Get interviews error:", error)
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    )
  }
} 