import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Update interview status
    const result = await db.collection("interviews").updateOne(
      { 
        _id: new ObjectId(resolvedParams.id),
        userId: session.user.id,
        status: "pending" // Only allow starting pending interviews
      },
      {
        $set: {
          status: "in_progress",
          startedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Interview not found or cannot be started" },
        { status: 404 }
      )
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to start interview" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Interview started successfully"
    })
  } catch (error) {
    console.error("Error starting interview:", error)
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    )
  }
} 