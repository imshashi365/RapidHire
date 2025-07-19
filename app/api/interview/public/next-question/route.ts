import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const { interviewId, token, currentQuestion } = await req.json()

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

    // Get the position details to access questions
    const position = await db.collection("positions").findOne({
      _id: new ObjectId(interview.positionId)
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    // Check if position has questions
    if (!position.questions || position.questions.length === 0) {
      // Use default questions if position doesn't have any
      const defaultQuestions = [
        "Tell me about yourself and your background.",
        "What interests you about this position?",
        "What are your key strengths that make you suitable for this role?",
        "Can you describe a challenging project you've worked on?",
        "Where do you see yourself in five years?",
      ]
      
      // Get the next question
      const questionIndex = currentQuestion || 0
      if (questionIndex >= defaultQuestions.length) {
        return NextResponse.json({ error: "No more questions available" }, { status: 400 })
      }
      
      const question = defaultQuestions[questionIndex]
      
      // Update the interview with current question
      await db.collection("interviews").updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            currentQuestion: question,
            questionNumber: questionIndex + 1,
            updatedAt: new Date()
          }
        }
      )
      
      return NextResponse.json({ question })
    }
    
    // Get the next question from position questions
    const questionIndex = currentQuestion || 0
    if (questionIndex >= position.questions.length) {
      return NextResponse.json({ error: "No more questions available" }, { status: 400 })
    }
    
    const question = position.questions[questionIndex]
    
    // Update the interview with current question
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          currentQuestion: question,
          questionNumber: questionIndex + 1,
          updatedAt: new Date()
        }
      }
    )
    
    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error getting next question:", error)
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    )
  }
}
