import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// This route must be server-side rendered as it uses session and database
export const dynamic = 'force-dynamic'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

// Handle OPTIONS method for CORS preflight
const handleOptions = () => {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  })
}

export async function GET(req: Request) {
  // Handle OPTIONS method for CORS
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: corsHeaders }
      )
    }

    if (session.user.role !== "candidate") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: corsHeaders }
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
      return new NextResponse(
        JSON.stringify({
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
        }),
        { status: 200, headers: corsHeaders }
      )
    }

    return new NextResponse(
      JSON.stringify(profile),
      { status: 200, headers: corsHeaders }
    )
  } catch (error: unknown) {
    console.error("Get profile error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      }),
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function PUT(req: Request) {
  // Handle OPTIONS method for CORS
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: corsHeaders }
      )
    }

    if (session.user.role !== "candidate") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: corsHeaders }
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

    try {
      // First check if the candidate exists
      const existingCandidate = await db.collection("candidates").findOne({
        userId: new ObjectId(session.user.id)
      })

      if (!existingCandidate) {
        // If candidate doesn't exist, create a new profile
        await db.collection("candidates").insertOne({
          ...updateData,
          createdAt: now
        })
      } else {
        // If candidate exists, update the profile
        await db.collection("candidates").updateOne(
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
        return new NextResponse(
          JSON.stringify({ error: "Failed to update profile. Please try again." }),
          { status: 500, headers: corsHeaders }
        )
      }

      return new NextResponse(
        JSON.stringify(updatedProfile),
        { status: 200, headers: corsHeaders }
      )
    } catch (error: unknown) {
      console.error("Database operation error:", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return new NextResponse(
        JSON.stringify({ 
          error: "An unexpected error occurred. Please try again.",
          ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
        }),
        { status: 500, headers: corsHeaders }
      )
    }
  } catch (error: unknown) {
    console.error("Error in profile update:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to process request",
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      }),
      { status: 500, headers: corsHeaders }
    )
  }
}