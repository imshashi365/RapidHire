import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { GridFSBucket } from "mongodb"

export async function GET(
  req: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const bucket = new GridFSBucket(db, { bucketName: "resumes" })

    // Find the file
    const files = await bucket.find({ filename: params.filename }).toArray()
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Create a download stream
    const downloadStream = bucket.openDownloadStreamByName(params.filename)
    
    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${params.filename}"`,
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    )
  }
} 