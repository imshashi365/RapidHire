import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const interviewId = resolvedParams.id
    
    // Parse request body
    const { status } = await request.json()

    if (!status || !["pending", "scheduled", "in-progress", "completed", "cancelled", "shortlisted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Update the interview status
    const result = await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Interview status updated successfully" 
    })

  } catch (error) {
    console.error("Error updating interview status:", error)
    return NextResponse.json(
      { error: "Failed to update interview status" },
      { status: 500 }
    )
  }
}