import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import {
  createPosition,
  getPositionsByCompany,
  updatePosition,
  deletePosition,
} from "@/lib/utils/positionUtils"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from '@/lib/mongodb'
import { connectToDatabase } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "company") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const position = await req.json()
    
    const positionId = await createPosition({
      ...position,
      companyId: new ObjectId(session.user.id),
    })

    return NextResponse.json(
      { message: "Position created successfully", positionId },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create position error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('company')
    const username = searchParams.get('username')

    const { db } = await connectToDatabase()

    if (username) {
      // Find company by username first
      const company = await db.collection("users").findOne(
        { username, role: "company" }
      )

      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        )
      }

      // Then find positions for that company
      const positions = await db
        .collection("positions")
        .find({ companyId: new ObjectId(company._id) })
        .toArray()

      return NextResponse.json(positions)
    }

    if (companyId) {
      const positions = await db
        .collection("positions")
        .find({ companyId: new ObjectId(companyId) })
        .toArray()

      return NextResponse.json(positions)
    }

    return NextResponse.json(
      { error: "Company ID or username is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "company") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const updates = await req.json()
    const client = await clientPromise
    const db = client.db()

    // Update the position
    const result = await db.collection('positions').updateOne(
      { 
        _id: new ObjectId(id),
        companyId: new ObjectId(session.user.id) // Ensure company owns the position
      },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    // Fetch the updated position
    const updatedPosition = await db.collection('positions').findOne({
      _id: new ObjectId(id)
    })

    if (!updatedPosition) {
      return NextResponse.json(
        { error: "Failed to fetch updated position" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      position: {
        ...updatedPosition,
        _id: updatedPosition._id.toString()
      }
    })
  } catch (error) {
    console.error("Update position error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "company") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const success = await deletePosition(id)

    if (!success) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Position deleted successfully" }
    )
  } catch (error) {
    console.error("Delete position error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 