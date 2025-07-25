import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
}

async function getUniqueUsername(db: any, baseUsername: string, role: string): Promise<string> {
  let username = baseUsername
  let counter = 1
  
  // Add role prefix to distinguish between company and candidate usernames
  const prefix = role === "company" ? "c_" : "u_"
  username = `${prefix}${username}`
  
  while (await db.collection("users").findOne({ username })) {
    username = `${prefix}${baseUsername}${counter}`
    counter++
  }
  
  return username
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    let client
    try {
      client = await clientPromise
    } catch (error) {
      console.error("MongoDB connection error:", error)
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      )
    }

    const db = client.db()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Generate unique username for all users
    const baseUsername = generateUsername(name)
    const username = await getUniqueUsername(db, baseUsername, role)

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      username,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId: result.insertedId,
        username 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 