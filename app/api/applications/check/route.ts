import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const positionId = searchParams.get("positionId")

    if (!positionId) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if user has already applied for this position
    const existingApplication = await db.collection("applications").findOne({
      candidateId: new ObjectId(session.user.id),
      positionId: new ObjectId(positionId),
    })

    return NextResponse.json({
      hasApplied: !!existingApplication,
      application: existingApplication ? {
        id: existingApplication._id.toString(),
        status: existingApplication.status,
        createdAt: existingApplication.createdAt,
      } : null,
    })
  } catch (error) {
    console.error("Check application error:", error)
    return NextResponse.json(
      { error: "Failed to check application" },
      { status: 500 }
    )
  }
} 