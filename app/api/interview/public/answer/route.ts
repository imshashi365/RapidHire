import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { interviewId, token, question, answer, questionNumber } = await req.json()

    if (!interviewId || !token || !question || !answer) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Score the answer using OpenAI
    const scoreResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer evaluating candidate responses for a ${position.title} position.
          Score the candidate's answer on a scale of 1-10 and provide brief feedback.
          Return your response in JSON format with the following structure:
          {
            "score": <number between 1 and 10>,
            "feedback": "<brief constructive feedback about the answer>"
          }`
        },
        {
          role: "user",
          content: `Question: ${question}\nCandidate's Answer: ${answer}`
        }
      ],
      response_format: { type: "json_object" }
    })

    const scoreData = JSON.parse(scoreResponse.choices[0].message.content)

    // Store the answer and score
    const answerData = {
      question,
      answer,
      score: scoreData.score,
      feedback: scoreData.feedback,
      questionNumber
    }

    // Update the interview with the answer
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $push: {
          answers: answerData
        },
        $set: {
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true,
      score: scoreData.score,
      feedback: scoreData.feedback
    })
  } catch (error) {
    console.error("Error processing answer:", error)
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    )
  }
}
