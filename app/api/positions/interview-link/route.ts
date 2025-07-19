import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const positionId = url.searchParams.get("positionId")

    if (!positionId) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if the position exists and belongs to the company
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(positionId),
      companyId: new ObjectId(session.user.id)
    })

    if (!position) {
      return NextResponse.json(
        { error: "Position not found or does not belong to this company" },
        { status: 404 }
      )
    }

    // Find the active interview link for this position
    const interviewLink = await db.collection("interviewLinks").findOne({
      positionId: new ObjectId(positionId),
      active: true
    })

    if (!interviewLink) {
      return NextResponse.json(
        { error: "No active interview link found" },
        { status: 404 }
      )
    }

    // Generate the full interview link
    const fullInterviewLink = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/interview/public/${interviewLink.token}`

    return NextResponse.json({ 
      interviewLink: fullInterviewLink,
      token: interviewLink.token
    })
  } catch (error) {
    console.error("Error fetching interview link:", error)
    return NextResponse.json(
      { error: "Failed to fetch interview link" },
      { status: 500 }
    )
  }
}
