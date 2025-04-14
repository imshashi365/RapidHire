import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import Together from "together-ai"

const together = new Together() // auth defaults to process.env.TOGETHER_API_KEY

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, transcript, questionNumber } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 })
    }

    // Get interview details from database
    const { db } = await connectToDatabase()
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    const { jobDescription, requirements, previousQuestions = [] } = interview

    // Generate next question using Together AI
    const response = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer. You are conducting an interview for the following position:

Job Description:
${jobDescription}

Requirements:
${requirements}

Previous questions asked:
${previousQuestions.join("\n")}

Last candidate response:
${transcript || "No response yet (interview starting)"}

Based on this information, generate a relevant technical question that:
1. Tests the candidate's knowledge of required skills
2. Follows up on their previous response if applicable
3. Is clear and specific
4. Encourages detailed responses

Format your response as a single question without any additional text.`
        }
      ],
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
      temperature: 0.7,
      max_tokens: 200,
    })

    if (!response.choices?.[0]?.message?.content) {
      throw new Error("No question generated")
    }

    const question = response.choices[0].message.content.trim()

    // Store the question in the database
    await db.collection("interviews").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { previousQuestions: question },
        $set: { lastQuestionAt: new Date() }
      }
    )

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error generating question:", error)
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    )
  }
} 