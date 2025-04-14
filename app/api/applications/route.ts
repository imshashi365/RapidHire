import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get all applications for the current user with position data
    const applications = await db.collection("applications")
      .aggregate([
        {
          $match: {
            candidateId: new ObjectId(session.user.id)
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
      .toArray()

    // Format applications
    const formattedApplications = applications.map(application => ({
      id: application._id.toString(),
      position: {
        id: application.position._id.toString(),
        title: application.position.title,
        companyName: application.position.companyName || "Unknown Company",
        department: application.position.department,
      },
      status: application.status || "pending",
      createdAt: application.createdAt ? new Date(application.createdAt).toISOString() : null,
      updatedAt: application.updatedAt ? new Date(application.updatedAt).toISOString() : null,
    }))

    return NextResponse.json(formattedApplications)
  } catch (error) {
    console.error("Get applications error:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { positionId } = await request.json()

    if (!positionId) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if user has already applied
    const existingApplication = await db.collection("applications").findOne({
      candidateId: new ObjectId(session.user.id),
      positionId: new ObjectId(positionId),
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this position" },
        { status: 400 }
      )
    }

    // Get position details
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(positionId)
    })

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    // Create new application
    const application = {
      candidateId: new ObjectId(session.user.id),
      positionId: new ObjectId(positionId),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("applications").insertOne(application)

    // Create interview record
    const interview = {
      candidateId: new ObjectId(session.user.id),
      positionId: new ObjectId(positionId),
      position: {
        title: position.title,
        department: position.department,
        companyName: position.companyName,
        requirements: position.requirements || [],
      },
      status: "pending",
      isStarted: false,
      date: null,
      lastDate: position.lastDate ? new Date(position.lastDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      transcript: "",
      questionNumber: 0,
      currentQuestion: null,
      aiResponse: null,
    }

    const interviewResult = await db.collection("interviews").insertOne(interview)

    return NextResponse.json({
      application: {
        id: result.insertedId.toString(),
        ...application,
        _id: undefined,
      },
      interview: {
        id: interviewResult.insertedId.toString(),
        ...interview,
        _id: undefined,
      }
    })
  } catch (error) {
    console.error("Create application error:", error)
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    )
  }
} 