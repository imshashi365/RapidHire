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
    const session = await getServerSession(authOptions)
    
    console.log("API Route - Session:", session)
    
    if (!session) {
      console.log("API Route - No session found")
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 }
      )
    }

    if (session.user.role !== "company") {
      console.log("API Route - Invalid role:", session.user.role)
      return NextResponse.json(
        { error: "Unauthorized - Invalid role" },
        { status: 401 }
      )
    }

    const positions = await getPositionsByCompany(session.user.id)
    return NextResponse.json(positions)
  } catch (error) {
    console.error("Get positions error:", error)
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

    const { id, ...updates } = await req.json()
    
    const success = await updatePosition(id, updates)

    if (!success) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Position updated successfully" }
    )
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