import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { positionId, candidateId, date, lastDate } = await req.json()

    if (!positionId || !candidateId || !date || !lastDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Create new interview
    const interview = await db.collection("interviews").insertOne({
      positionId: new ObjectId(positionId),
      userId: new ObjectId(session.user.id),
      candidateId: new ObjectId(candidateId),
      status: "pending",
      date: new Date(date),
      lastDate: new Date(lastDate),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error("Error creating interview:", error)
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("No session or user ID found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session user ID:", session.user.id)
    console.log("Session user role:", session.user.role)

    const { db } = await connectToDatabase()

    // First, check if there are any interviews in the collection
    const totalInterviews = await db.collection("interviews").countDocuments()
    console.log("Total interviews in collection:", totalInterviews)

    // Check if there are any interviews for this user using either userId or candidateId
    const userInterviewsCount = await db.collection("interviews").countDocuments({
      $or: [
        { userId: new ObjectId(session.user.id) },
        { candidateId: new ObjectId(session.user.id) }
      ]
    })
    console.log("Interviews for user:", userInterviewsCount)
    console.log("Searching for interviews with userId or candidateId:", session.user.id)

    const interviews = await db
      .collection("interviews")
      .aggregate([
        {
          $match: {
            $or: [
              { userId: new ObjectId(session.user.id) },
              { candidateId: new ObjectId(session.user.id) }
            ]
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
        },
        {
          $project: {
            id: { $toString: "$_id" },
            status: 1,
            isStarted: 1,
            currentQuestion: 1,
            questionNumber: 1,
            transcript: 1,
            aiResponse: 1,
            score: 1,
            feedback: 1,
            startedAt: 1,
            createdAt: 1,
            updatedAt: 1,
            position: {
              title: 1,
              department: 1,
              companyName: 1
            }
          }
        }
      ])
      .toArray()

    console.log("Fetched interviews:", JSON.stringify(interviews, null, 2))
    return NextResponse.json(interviews)
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    )
  }
} 