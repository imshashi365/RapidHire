import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { positionId, candidateId, scheduledDate, scheduledTime } = await req.json()

    if (!positionId || !candidateId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Create interview record
    const interview = {
      positionId: new ObjectId(positionId),
      candidateId: new ObjectId(candidateId),
      status: "Scheduled",
      scheduledDate,
      scheduledTime,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("interviews").insertOne(interview)

    // Update application status
    await db.collection("applications").updateOne(
      {
        positionId: new ObjectId(positionId),
        candidateId: new ObjectId(candidateId)
      },
      {
        $set: {
          status: "scheduled",
          interviewId: result.insertedId,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json(
      { message: "Interview scheduled successfully", interviewId: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error scheduling interview:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 