import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // Validate username parameter
    if (!params?.username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const username = params.username

    const company = await db.collection("users").findOne(
      { 
        username,
        role: "company"
      },
      { 
        projection: { 
          password: 0,
          createdAt: 0,
          updatedAt: 0
        } 
      }
    )

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    )
  }
} 