import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Together from "together-ai"
import { connectToDatabase } from "@/lib/mongodb"

const together = new Together() // auth defaults to process.env.TOGETHER_API_KEY

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, transcript } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 })
    }

    // Get interview details from database
    const { db } = await connectToDatabase()
    const interview = await db.collection("interviews").findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    const { jobDescription, requirements, previousQuestions = [], previousResponses = [] } = interview

    // Add final response to the list
    const allResponses = [...previousResponses, transcript]

    // Generate interview feedback using Together AI
    const response = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer evaluating a candidate. Review the following interview:

Job Description:
${jobDescription}

Requirements:
${requirements}

Interview Transcript:
${previousQuestions.map((q: string, i: number) => `Q${i + 1}: ${q}\nA${i + 1}: ${allResponses[i] || "No response"}`).join("\n\n")}

Provide a comprehensive evaluation including:
1. A score out of 100
2. 3-5 key strengths demonstrated in the interview
3. 3-5 areas for improvement

Format your response as a JSON object with these keys:
- score: number
- strengths: string[]
- weaknesses: string[]`
        }
      ],
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    })

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("No feedback generated")
    }

    const feedback = JSON.parse(response.choices[0].message.content)

    // Validate feedback format
    if (!feedback.score || !Array.isArray(feedback.strengths) || !Array.isArray(feedback.weaknesses)) {
      throw new Error("Invalid feedback format")
    }

    // Store the feedback and complete the interview
    await db.collection("interviews").updateOne(
      { _id: id },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          feedback,
          finalTranscript: transcript
        }
      }
    )

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    )
  }
} 