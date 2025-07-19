import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { resume, position, questions } = await req.json()

    if (!resume || !position) {
      return NextResponse.json({ error: "Resume and position are required" }, { status: 400 })
    }

    // Get the Gemini API key from environment variables
    const GEMINI_API_KEY = process.env.GOOGLE_API_KEY
   
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured. Please check your .env file.')
    }
    // Prepare the prompt for Gemini
    const prompt = `
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
    `

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const geminiData = await response.json()
    const generatedText = geminiData.candidates[0].content.parts[0].text

    // Parse the generated questions
    let parsedQuestions
    try {
      // Try to find a valid JSON array in the response
      // Using a simpler regex without the 's' flag which requires ES2018+
      const jsonMatch = generatedText.match(/\[([\s\S]*)\]/)
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0])
      } else {
        // If parsing fails, extract questions manually without using 's' flag
        // Using a workaround for the 's' flag which requires ES2018+
        const questionRegex = /\d+\.\s+(.*?)(?=\d+\.|$)/g
        // Replace newlines with spaces to simulate 's' flag behavior
        const normalizedText = generatedText.replace(/\n/g, ' ')
        const matches = [...normalizedText.matchAll(questionRegex)]
        parsedQuestions = matches.map((match) => match[1].trim())
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      // If parsing fails, extract questions manually
      const questionRegex = /\d+\.\s+(.*?)(?=\d+\.|$)/
      const matches = [...generatedText.matchAll(questionRegex)]
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
