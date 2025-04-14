import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"
import { Document } from "@langchain/core/documents"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Convert file to text
    let text = ""
    const fileType = file.type

    try {
      if (fileType === "application/pdf") {
        const loader = new WebPDFLoader(file)
        const docs = await loader.load()
        text = docs.map((doc: Document) => doc.pageContent).join("\n")
      } else if (fileType === "text/plain") {
        text = await file.text()
      } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        text = buffer.toString()
      } else {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
      }

      if (!text.trim()) {
        return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 })
      }

      // Analyze resume using OpenAI
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert resume analyzer. Analyze the following resume and provide:
            1. A score out of 100
            2. Key strengths (3-5 points)
            3. Areas for improvement (3-5 points)
            
            Format your response as a JSON object with these keys:
            - score: number
            - strengths: string[]
            - improvements: string[]`
          },
          {
            role: "user",
            content: `Here is the resume text to analyze:\n\n${text}`
          }
        ],
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })

      if (!response.choices?.[0]?.message?.content) {
        throw new Error("No content received from OpenAI")
      }

      const content = response.choices[0].message.content
      const analysis = JSON.parse(content)

      // Validate the analysis object
      if (!analysis.score || !Array.isArray(analysis.strengths) || !Array.isArray(analysis.improvements)) {
        throw new Error("Invalid response format from AI")
      }

      return NextResponse.json(analysis)
    } catch (error) {
      console.error("Error processing file:", error)
      return NextResponse.json(
        { error: "Error processing file. Please try again." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    )
  }
} 