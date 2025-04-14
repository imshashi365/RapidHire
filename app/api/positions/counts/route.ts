import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "company") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Get all positions for the company
    const positions = await db.collection("positions").find({
      companyId: new ObjectId(session.user.id)
    }).toArray()

    // Get application counts for each position
    const positionCounts = await Promise.all(
      positions.map(async (position) => {
        const count = await db.collection("applications").countDocuments({
          positionId: position._id,
          status: { $in: ["pending", "accepted"] }
        })
        return {
          positionId: position._id.toString(),
          count
        }
      })
    )

    return NextResponse.json(positionCounts)
  } catch (error) {
    console.error("Error getting application counts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 