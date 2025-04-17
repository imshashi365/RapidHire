import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Get the ID parameter
    const { id } = context.params
    if (!id) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid position ID format" },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await connectToDatabase()
    
    // Find the position
    const position = await db.db.collection("positions").findOne({
      _id: new ObjectId(id)
    })

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(position)
  } catch (error) {
    console.error("Error fetching position:", error)
    return NextResponse.json(
      { error: "Failed to fetch position" },
      { status: 500 }
    )
  }
}

// Optional: Add DELETE method if you want to handle position deletion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const objectId = new ObjectId(id)

    const result = await db.collection("positions").deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Position deleted successfully" })
  } catch (error) {
    console.error("Error deleting position:", error)
    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 500 }
    )
  }
}

// Optional: Add PATCH method for updating positions
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const objectId = new ObjectId(id)

    const result = await db.collection("positions").updateOne(
      { _id: objectId },
      { $set: updates }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    // Fetch and return the updated position
    const updatedPosition = await db.collection("positions").findOne({ _id: objectId })
    return NextResponse.json(updatedPosition)
  } catch (error) {
    console.error("Error updating position:", error)
    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 500 }
    )
  }
} 