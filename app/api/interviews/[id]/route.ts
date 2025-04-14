import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await the params to get the ID
    const resolvedParams = await params
    const id = resolvedParams.id
    console.log("Fetching interview with ID:", id)

    const { db } = await connectToDatabase()
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid interview ID" }, { status: 400 })
    }

    // First try to find the interview by ID
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(id)
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Log the found interview for debugging
    console.log("Found interview:", interview)

    // Fetch associated position details
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(interview.positionId)
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    // Log the found position for debugging
    console.log("Found position:", position)

    // Return the combined data
    const responseData = {
      ...interview,
      position: {
        ...position,
        questions: position.questions || []
      }
    }

    console.log("Returning response data:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching interview:", error)
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    )
  }
} 