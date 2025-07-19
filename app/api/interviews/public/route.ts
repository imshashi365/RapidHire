import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Find all public interviews using MongoDB aggregation
    const interviews = await db.collection("interviews")
      .aggregate([
        {
          $match: {
            isPublic: true
          }
        },
        {
          $lookup: {
            from: "positions",
            localField: "positionId",
            foreignField: "_id",
            as: "position"
          }
        },
        {
          $unwind: {
            path: "$position",
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .sort({ createdAt: -1 })
      .toArray()

    // Transform the data to match the frontend expectations
    const transformedInterviews = interviews.map(interview => ({
      _id: interview._id.toString(),
      title: interview.position?.title || "Untitled Position",
      position: {
        _id: interview.position?._id.toString(),
        title: interview.position?.title || "Untitled Position",
        companyName: interview.position?.companyName || "Unknown Company",
        department: interview.position?.department || "",
      },
      status: interview.status || "active",
      token: interview.token,
      isPublic: interview.isPublic || false,
      views: interview.views || 0,
      attempts: interview.attempts || 0,
      maxAttempts: interview.maxAttempts,
      createdAt: interview.createdAt ? new Date(interview.createdAt).toISOString() : new Date().toISOString()
    }))

    return NextResponse.json(transformedInterviews)
  } catch (error) {
    console.error("Error fetching public interviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    )
  }
}