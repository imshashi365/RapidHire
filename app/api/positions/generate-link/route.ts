import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { positionId } = await req.json()

    if (!positionId) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Check if the position exists and belongs to the company
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(positionId),
      companyId: new ObjectId(session.user.id)
    })

    if (!position) {
      return NextResponse.json(
        { error: "Position not found or does not belong to this company" },
        { status: 404 }
      )
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Store the token in the database
    await db.collection("interviewLinks").insertOne({
      positionId: new ObjectId(positionId),
      token,
      companyId: new ObjectId(session.user.id),
      createdAt: new Date(),
      active: true
    })

    // Generate the full interview link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set")
    }
    const interviewLink = `${appUrl}/interview/public/${token}`

    return NextResponse.json({ 
      interviewLink,
      token
    })
  } catch (error) {
    console.error("Error generating interview link:", error)
    return NextResponse.json(
      { error: "Failed to generate interview link" },
      { status: 500 }
    )
  }
}
