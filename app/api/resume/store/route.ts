import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { analysis, pdfUrl } = await req.json()
    const client = await clientPromise
    const db = client.db()

    // Store resume data
    await db.collection("resumes").updateOne(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          analysis,
          pdfUrl,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing resume:", error)
    return NextResponse.json(
      { error: "Failed to store resume" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const resume = await db.collection("resumes").findOne(
      { userId: session.user.id },
      { projection: { _id: 0, userId: 0 } }
    )

    return NextResponse.json(resume || {})
  } catch (error) {
    console.error("Error fetching resume:", error)
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    )
  }
} 