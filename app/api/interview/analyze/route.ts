import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { resume, position, questions } = await req.json()

    if (!resume || !position) {
      return NextResponse.json({ error: "Resume and position are required" }, { status: 400 })
    }

    // Generate interview questions based on resume and position
    const { text: generatedQuestions } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        You are an AI interviewer for a ${position} position.
        
        Resume: ${resume}
        
        Based on this resume, generate 5 relevant interview questions that will help assess the candidate's fit for the ${position} position.
        
        The questions should:
        1. Be specific to the candidate's experience and skills
        2. Assess technical knowledge relevant to the position
        3. Evaluate problem-solving abilities
        4. Gauge communication skills
        5. Determine cultural fit
        
        Format the response as a JSON array of strings.
      `,
    })

    // Parse the generated questions
    let parsedQuestions
    try {
      parsedQuestions = JSON.parse(generatedQuestions)
    } catch (error) {
      // If parsing fails, extract questions manually
      const questionRegex = /\d+\.\s+(.*?)(?=\d+\.|$)/gs
      const matches = [...generatedQuestions.matchAll(questionRegex)]
      parsedQuestions = matches.map((match) => match[1].trim())
    }

    return NextResponse.json({
      questions: parsedQuestions || [],
      position,
    })
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 })
  }
}

