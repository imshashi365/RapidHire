import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { interviewId, conversationId, transcript, questionNumber } = await req.json()
    if (!interviewId || !conversationId || !transcript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get the conversation
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(conversationId)
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get the interview for context
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(interviewId)
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Evaluate the answer using OpenAI
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert interviewer evaluating candidates. 
          The position is for ${interview.position.title} at ${interview.position.companyName}.
          Requirements: ${interview.position.requirements}
          
          Evaluate the candidate's answer to the following question. Provide:
          1. A score from 0-100
          2. Brief, constructive feedback
          3. Whether the answer was complete enough to move to the next question`
        },
        {
          role: "user",
          content: `Question: ${conversation.questions[questionNumber]}
          
          Candidate's Answer: ${transcript}`
        }
      ]
    })

    const evaluationResponse = evaluation.choices[0].message.content
    const evaluationData = JSON.parse(evaluationResponse)

    // Store the answer and evaluation
    const answer = {
      question: conversation.questions[questionNumber],
      answer: transcript,
      score: evaluationData.score,
      feedback: evaluationData.feedback,
      timestamp: new Date()
    }

    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $push: { answers: answer },
        $inc: { currentQuestionIndex: 1 }
      }
    )

    // Check if this was the last question
    const isComplete = questionNumber >= conversation.questions.length - 1

    if (isComplete) {
      // Calculate final score and generate overall feedback
      const finalEvaluation = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert interviewer providing final evaluation for a ${interview.position.title} position.
            Review all questions and answers to provide:
            1. Overall score (0-100)
            2. Key strengths (3 points)
            3. Areas for improvement (3 points)
            4. Overall feedback and recommendations`
          },
          {
            role: "user",
            content: `Interview Transcript:
            ${conversation.answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}`
          }
        ]
      })

      const finalFeedback = JSON.parse(finalEvaluation.choices[0].message.content)

      // Update interview with final results
      await db.collection("interviews").updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
            score: finalFeedback.score,
            feedback: {
              strengths: finalFeedback.strengths,
              weaknesses: finalFeedback.areasForImprovement,
              overallFeedback: finalFeedback.overallFeedback
            }
          }
        }
      )

      return NextResponse.json({ isComplete: true })
    }

    // Return next question
    return NextResponse.json({
      isComplete: false,
      nextQuestion: conversation.questions[questionNumber + 1],
      score: evaluationData.score,
      feedback: evaluationData.feedback
    })
  } catch (error) {
    console.error("Error processing response:", error)
    return NextResponse.json(
      { error: "Failed to process response" },
      { status: 500 }
    )
  }
} 