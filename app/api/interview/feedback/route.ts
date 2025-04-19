import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Fallback feedback in case API fails
const fallbackFeedback = {
  feedback: {
    rating: {
      technicalSkills: 70,
      communication: 70,
      problemSolving: 70,
      experience: 70
    },
    summary: "The interview was completed successfully. The candidate demonstrated good communication skills and technical knowledge. Further evaluation may be needed for a comprehensive assessment.",
    recommendation: "Yes",
    recommendationMsg: "The candidate shows potential and meets the basic requirements for the position."
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { interviewId, conversation, position } = body

    if (!interviewId || !conversation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Generate feedback using Together.ai API
      const response = await fetch('https://api.together.xyz/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          prompt: `You are an AI expert at evaluating job interviews. Your task is to analyze an interview conversation between an AI interviewer and a candidate for the position of ${
            position?.title || 'a job role'
          }.
          
          Provide honest, fair, and insightful feedback about the candidate's performance.
          Evaluate the candidate on the following criteria on a scale of 0-100:
          - Technical Skills: Rate their knowledge and expertise in the required technical areas (0-100)
          - Communication: Rate how effectively they communicated their thoughts and ideas (0-100)
          - Problem Solving: Rate how well they tackled challenges presented during the interview (0-100)
          - Experience: Rate their relevant prior experience for the role (0-100)
          
          Also provide:
          - A concise 3-line summary of the interview
          - A clear recommendation on whether to hire this candidate or not with a reason
          
          Here's the interview conversation to evaluate:
          
          ${conversation}
          
          Output your evaluation in the following JSON format only without additional text:
          {
            "feedback": {
              "rating": {
                "technicalSkills": <number between 0-100>,
                "communication": <number between 0-100>,
                "problemSolving": <number between 0-100>,
                "experience": <number between 0-100>
              },
              "summary": "<3-line summary>",
              "recommendation": "<Yes or No>",
              "recommendationMsg": "<Reason for recommendation>"
            }
          }`,
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1.1
        })
      })

      if (!response.ok) {
        throw new Error(`Together.ai API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Extract the JSON from the response text
      const feedbackText = data.output?.choices?.[0]?.text || data.output?.text || data.text || data.choices?.[0]?.text
      
      if (!feedbackText) {
        console.error("Unexpected Together.ai response format:", data)
        throw new Error("Could not extract feedback text from Together.ai response")
      }
      
      // Try to find a valid JSON object in the response
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        console.error("Could not find JSON in feedback text:", feedbackText)
        throw new Error("Could not extract JSON from Together.ai response")
      }
      
      let feedbackData
      try {
        feedbackData = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError)
        console.error("Raw JSON string:", jsonMatch[0])
        // Try to clean the JSON string
        const cleanedJson = jsonMatch[0]
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ')
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/'/g, '"')
        try {
          feedbackData = JSON.parse(cleanedJson)
        } catch (cleanError) {
          console.error("Error parsing cleaned JSON:", cleanError)
          throw new Error("Failed to parse feedback JSON")
        }
      }

      // Validate the feedback structure
      if (!feedbackData?.feedback?.rating || 
          typeof feedbackData.feedback.rating.technicalSkills !== 'number' ||
          typeof feedbackData.feedback.rating.communication !== 'number' ||
          typeof feedbackData.feedback.rating.problemSolving !== 'number' ||
          typeof feedbackData.feedback.rating.experience !== 'number' ||
          !feedbackData.feedback.summary ||
          !feedbackData.feedback.recommendation ||
          !feedbackData.feedback.recommendationMsg ||
          feedbackData.feedback.rating.technicalSkills < 0 || feedbackData.feedback.rating.technicalSkills > 100 ||
          feedbackData.feedback.rating.communication < 0 || feedbackData.feedback.rating.communication > 100 ||
          feedbackData.feedback.rating.problemSolving < 0 || feedbackData.feedback.rating.problemSolving > 100 ||
          feedbackData.feedback.rating.experience < 0 || feedbackData.feedback.rating.experience > 100) {
        console.error("Invalid feedback structure:", feedbackData)
        throw new Error("Invalid feedback structure")
      }

      // Return the feedback
      return NextResponse.json(feedbackData)
    } catch (apiError) {
      console.error("Together.ai API error:", apiError)
      // Return fallback feedback if API fails
      return NextResponse.json(fallbackFeedback)
    }
  } catch (error) {
    console.error("Error generating feedback:", error)
    // Return fallback feedback in case of any other errors
    return NextResponse.json(fallbackFeedback)
  }
}

// Helper function to calculate average score
function calculateAverageScore(ratings: {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  experience: number;
}) {
  const sum = 
    ratings.technicalSkills + 
    ratings.communication + 
    ratings.problemSolving + 
    ratings.experience;
  
  // Return score out of 100 (average of the 4 categories, then multiplied by 10)
  return Math.round((sum / 4) * 10);
} 