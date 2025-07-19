import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
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

    return NextResponse.json({
      position: {
        id: position._id.toString(),
        title: position.title,
        companyName: position.companyName,
        department: position.department
      }
    })
  } catch (error) {
    console.error("Error validating interview link:", error)
    return NextResponse.json(
      { error: "Failed to validate interview link" },
      { status: 500 }
    )
  }
}
