import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { interviewId, token } = await req.json()

    if (!interviewId || !token) {
      return NextResponse.json(
        { error: "Interview ID and token are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Verify the token matches the interview
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(interviewId),
      publicToken: token,
      isPublic: true
    })

    if (!interview) {
      return NextResponse.json({ error: "Invalid interview session" }, { status: 404 })
    }

    // Get the position details
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(interview.positionId)
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    // Calculate overall score based on answers
    let overallScore = 0
    if (interview.answers && interview.answers.length > 0) {
      const totalScore = interview.answers.reduce((sum, answer) => sum + answer.score, 0)
      overallScore = Math.round(totalScore / interview.answers.length)
    }

    // Generate feedback using OpenAI
    const feedbackResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer providing feedback for a candidate who interviewed for a ${position.title} position.
          Based on their answers, provide a comprehensive feedback summary.
          Return your response in JSON format with the following structure:
          {
            "summary": "<overall assessment of the candidate's performance>",
            "strengths": ["<strength 1>", "<strength 2>", ...],
            "areas_for_improvement": ["<area 1>", "<area 2>", ...],
            "recommendation": "<hire|consider|reject>",
            "recommendation_reason": "<brief explanation for the recommendation>"
          }`
        },
        {
          role: "user",
          content: `Position: ${position.title}
          Candidate: ${interview.candidateInfo.name}
          Overall Score: ${overallScore}/10
          
          Interview Questions and Answers:
          ${interview.answers ? interview.answers.map(a => 
            `Question: ${a.question}\nAnswer: ${a.answer}\nScore: ${a.score}/10\nFeedback: ${a.feedback}`
          ).join('\n\n') : 'No answers recorded'}`
        }
      ],
      response_format: { type: "json_object" }
    })

    const feedbackData = JSON.parse(feedbackResponse.choices[0].message.content)

    // Update the interview with completion data
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          score: overallScore,
          feedback: {
            summary: feedbackData.summary,
            strengths: feedbackData.strengths,
            areasForImprovement: feedbackData.areas_for_improvement,
            recommendation: feedbackData.recommendation,
            recommendationMsg: feedbackData.recommendation_reason,
            overallScore
          },
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      message: "Interview completed successfully",
      score: overallScore
    })
  } catch (error) {
    console.error("Error completing interview:", error)
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    )
  }
}
