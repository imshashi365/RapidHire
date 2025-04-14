import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the ID parameter
    const id = await params.id
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