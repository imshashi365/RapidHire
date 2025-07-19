import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const { token, candidateInfo } = await req.json()

    if (!token || !candidateInfo) {
      return NextResponse.json(
        { error: "Token and candidate information are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Find the interview link
    const interviewLink = await db.collection("interviewLinks").findOne({
      token,
      active: true
    })

    if (!interviewLink) {
      return NextResponse.json({ error: "Invalid or expired interview link" }, { status: 404 })
    }

    // Get the position details
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(interviewLink.positionId)
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    // Create a new interview record
    const interview = await db.collection("interviews").insertOne({
      positionId: new ObjectId(interviewLink.positionId),
      userId: new ObjectId(interviewLink.companyId), // Company ID as the user ID
      candidateInfo: {
        name: candidateInfo.name,
        email: candidateInfo.email,
        phone: candidateInfo.phone,
        createdAt: new Date()
      },
      status: "pending",
      isPublic: true, // Mark this as a public interview
      publicToken: token,
      isStarted: false,
      date: new Date(),
      lastDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Set expiry to 7 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      success: true,
      interviewId: interview.insertedId.toString()
    })
  } catch (error) {
    console.error("Error starting public interview:", error)
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    )
  }
}
