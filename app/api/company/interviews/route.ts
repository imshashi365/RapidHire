import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log("User ID:", session.user.id)

    // Connect to database
    const { db } = await connectToDatabase()

    // First, fetch all positions for this company
    const positions = await db
      .collection("positions")
      .find({ companyId: new ObjectId(session.user.id) })
      .toArray()

    console.log("Found positions:", positions.length, positions.map(p => ({ id: p._id.toString(), title: p.title })))

    if (positions.length === 0) {
      return NextResponse.json([])
    }

    // Get array of position IDs as ObjectId
    const positionIds = positions.map(position => 
      typeof position._id === 'string' ? new ObjectId(position._id) : position._id
    )

    console.log("Position IDs:", positionIds.map(id => id.toString()))

    // Fetch interviews that match these positions with pipeline
    const interviews = await db
      .collection("interviews")
      .aggregate([
        {
          $match: {
            positionId: { 
              $in: positionIds 
            }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "candidateId",
            foreignField: "_id",
            as: "candidate"
          }
        },
        {
          $unwind: {
            path: "$candidate",
            preserveNullAndEmptyArrays: true
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
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            _id: 1,
            candidateName: "$candidate.name",
            candidateEmail: "$candidate.email",
            positionId: 1,
            status: 1,
            date: 1,
            score: 1,
            position: {
              _id: 1,
              title: 1,
              companyId: 1
            }
          }
        },
        {
          $sort: { date: -1 }
        }
      ])
      .toArray()

    console.log("Final interviews:", interviews.length)

    // Transform ObjectIds to strings in the response
    const transformedInterviews = interviews.map(interview => ({
      ...interview,
      _id: interview._id.toString(),
      positionId: interview.positionId.toString(),
      position: {
        ...interview.position,
        _id: interview.position._id.toString(),
        companyId: interview.position.companyId.toString()
      }
    }))

    return NextResponse.json(transformedInterviews)
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    )
  }
} 