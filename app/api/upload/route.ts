import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { GridFSBucket } from "mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    
    // Initialize GridFS bucket
    const bucket = new GridFSBucket(db, { bucketName: "resumes" })

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${session.user.id}-${Date.now()}-${file.name}`

    // Upload file to GridFS
    const uploadStream = bucket.openUploadStream(filename)
    await new Promise((resolve, reject) => {
      uploadStream.write(buffer)
      uploadStream.end()
      uploadStream.on("finish", resolve)
      uploadStream.on("error", reject)
    })

    // Return the file URL
    const pdfUrl = `/api/resume/file/${filename}`
    return NextResponse.json({ pdfUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    )
  }
} 