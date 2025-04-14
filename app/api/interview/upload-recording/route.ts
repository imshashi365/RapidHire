import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("recording") as File
    const interviewId = formData.get("interviewId") as string

    if (!file || !interviewId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get the interview
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(interviewId)
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `interviews/${interviewId}/${Date.now()}.webm`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type
      })
    )

    // Update interview with recording URL
    const recordingUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          recordingUrl
        }
      }
    )

    return NextResponse.json({ success: true, recordingUrl })
  } catch (error) {
    console.error("Error uploading recording:", error)
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    )
  }
} 