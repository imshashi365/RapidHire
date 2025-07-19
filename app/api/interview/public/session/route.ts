import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    const token = url.searchParams.get("token")

    if (!id || !token) {
      return NextResponse.json({ error: "Interview ID and token are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verify the token matches the interview
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(id),
      publicToken: token,
      isPublic: true
    })

    if (!interview) {
      return NextResponse.json({ error: "Invalid interview session" }, { status: 404 })
    }

    // Get the position details
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(interview.positionId)
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    return NextResponse.json({
      interview: {
        id: interview._id.toString(),
        status: interview.status,
        isStarted: interview.isStarted || false,
        candidateInfo: interview.candidateInfo
      },
      position: {
        id: position._id.toString(),
        title: position.title,
        companyName: position.companyName,
        department: position.department,
        questions: position.questions || []
      }
    })
  } catch (error) {
    console.error("Error fetching interview session:", error)
    return NextResponse.json(
      { error: "Failed to fetch interview session" },
      { status: 500 }
    )
  }
}
