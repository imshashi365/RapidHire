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
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Use projection to only fetch required fields
    const profile = await db.collection("candidates").findOne(
      { userId: new ObjectId(session.user.id) },
      {
        projection: {
          _id: 1,
          experience: 1,
          education: 1,
          skills: 1,
          user: 1,
          updatedAt: 1
        }
      }
    )

    if (!profile) {
      return NextResponse.json({
        experience: [],
        education: [],
        skills: [],
        user: {
          email: session.user.email || "",
          name: "",
          phone: "",
          location: "",
          website: "",
          bio: "",
          avatar: ""
        }
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
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
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const updates = await req.json()
    const client = await clientPromise
    const db = client.db()

    const now = new Date()
    
    // Create a clean update object without any MongoDB-specific fields
    const updateData = {
      experience: updates.experience || [],
      education: updates.education || [],
      skills: updates.skills || [],
      user: updates.user || {},
      updatedAt: now,
      userId: new ObjectId(session.user.id)
    }

    // First check if the candidate exists
    const existingCandidate = await db.collection("candidates").findOne({
      userId: new ObjectId(session.user.id)
    })

    let result
    if (!existingCandidate) {
      // If candidate doesn't exist, create a new profile
      result = await db.collection("candidates").insertOne({
        ...updateData,
        createdAt: now
      })
    } else {
      // If candidate exists, update the profile
      result = await db.collection("candidates").updateOne(
        { userId: new ObjectId(session.user.id) },
        { $set: updateData }
      )
    }

    // Fetch the updated profile
    const updatedProfile = await db.collection("candidates").findOne(
      { userId: new ObjectId(session.user.id) },
      {
        projection: {
          _id: 1,
          experience: 1,
          education: 1,
          skills: 1,
          user: 1,
          updatedAt: 1
        }
      }
    )

    if (!updatedProfile) {
      console.error("Failed to fetch updated profile")
      return NextResponse.json(
        { error: "Failed to update profile. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
} 