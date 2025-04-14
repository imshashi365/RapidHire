import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
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

    const { interviewId, answers } = await req.json()
    if (!interviewId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const interview = await db.db.collection("interviews").findOne({
      _id: new ObjectId(interviewId),
      userId: session.user.id
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Generate overall feedback and score using OpenAI
    const feedbackPrompt = `You are an expert interviewer. Please evaluate the following interview answers and provide:
    1. A score out of 100
    2. Key strengths
    3. Areas for improvement
    4. Overall feedback

    Interview Details:
    Position: ${interview.position.title}
    Questions and Answers:
    ${answers.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score}\nFeedback: ${qa.feedback}\n`).join('\n')}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer providing detailed feedback on interview performance."
        },
        {
          role: "user",
          content: feedbackPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const feedbackText = completion.choices[0].message.content
    const score = calculateOverallScore(answers)

    // Update interview in database
    await db.db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status: "completed",
          score,
          feedback: feedbackText,
          answers,
          completedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      score,
      feedback: feedbackText
    })
  } catch (error) {
    console.error("Error in scoring interview:", error)
    return NextResponse.json(
      { error: "Failed to process interview scoring" },
      { status: 500 }
    )
  }
}

function calculateOverallScore(answers: any[]): number {
  if (!answers.length) return 0
  const totalScore = answers.reduce((sum, qa) => sum + qa.score, 0)
  return Math.round(totalScore / answers.length)
} 