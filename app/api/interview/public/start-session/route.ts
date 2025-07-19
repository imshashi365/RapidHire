import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const { interviewId, token } = await req.json()

    if (!interviewId || !token) {
      return NextResponse.json(
        { error: "Interview ID and token are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Verify the token matches the interview
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(interviewId),
      publicToken: token,
      isPublic: true
    })

    if (!interview) {
      return NextResponse.json({ error: "Invalid interview session" }, { status: 404 })
    }

    // Update interview status to in-progress
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status: "in-progress",
          isStarted: true,
          startedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      message: "Interview session started successfully"
    })
  } catch (error) {
    console.error("Error starting interview session:", error)
    return NextResponse.json(
      { error: "Failed to start interview session" },
      { status: 500 }
    )
  }
}
