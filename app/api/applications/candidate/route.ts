import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (session.user.role !== "candidate") {
      return NextResponse.json(
        { error: "Unauthorized - Only candidates can view applications" },
        { status: 403 }
      )
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Get all applications for the candidate
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
          $lookup: {
            from: "companies",
            localField: "position.companyId",
            foreignField: "_id",
            as: "company"
          }
        },
        {
          $unwind: {
            path: "$position",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$company",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            positionId: 1,
            position: {
              title: 1,
              department: 1
            },
            company: {
              name: 1
            },
            status: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ])
      .toArray()

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 