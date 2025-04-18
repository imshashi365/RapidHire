import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { interviewId, conversation, position } = body

    if (!interviewId || !conversation || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare the prompt for GPT-4
    const prompt = `You are an expert technical interviewer. Analyze the following interview conversation for the position of ${position.title} and provide feedback in the following JSON format:

    {
      "rating": {
        "technicalSkills": number (1-10),
        "communication": number (1-10),
        "problemSolving": number (1-10),
        "experience": number (1-10)
      },
      "summary": "Three-line summary of the interview",
      "recommendation": "Hire/Do not hire with brief explanation"
    }

    Interview Conversation:
    ${conversation}

    Position Requirements:
    ${position.requirements?.join('\n') || 'No specific requirements listed'}

    Please provide your assessment in the exact JSON format specified above.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer. Analyze the interview and provide structured feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    // Extract and parse the response
    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error("No response from OpenAI")
    }

    // Parse the JSON response
    let feedback
    try {
      feedback = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      throw new Error("Invalid response format from OpenAI")
    }

    // Validate the feedback structure
    if (!feedback.rating || !feedback.summary || !feedback.recommendation) {
      throw new Error("Invalid feedback structure")
    }

    // Return the feedback
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error generating feedback:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate feedback",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 