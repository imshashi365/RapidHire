import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()
    const { id } = params // Await the params object
    if (!status || !["active", "disabled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Update interview status
    const result = await db.collection("interviews").updateOne(
      { 
        _id: new ObjectId(id),
        isPublic: true // Only update if it's a public interview
      },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Public interview not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating public interview status:", error)
    return NextResponse.json(
      { error: "Failed to update interview status" },
      { status: 500 }
    )
  }
}