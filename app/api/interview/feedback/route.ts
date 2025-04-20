import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

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

interface ApiError extends Error {
  code?: string;
  details?: unknown;
}

interface FeedbackResponse {
  feedback: {
    rating: {
      technicalSkills: number;
      communication: number;
      problemSolving: number;
      experience: number;
    };
    summary: string;
    recommendation: string;
    recommendationMsg: string;
  };
}

interface Position {
  title?: string;
  minExperience?: number;
  maxExperience?: number;
  requirements?: string[];
  questions?: string[];
}

interface RequestBody {
  interviewId: string;
  conversation: string;
  position?: Position;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error('Authentication failed: No valid session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    let body: RequestBody
    try {
      body = await request.json()
    } catch (error) {
      console.error('Invalid JSON in request body:', error)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { interviewId, conversation, position } = body

    // Validate required fields
    if (!interviewId || typeof interviewId !== 'string') {
      console.error('Invalid or missing interviewId:', interviewId)
      return NextResponse.json({ error: 'Invalid or missing interviewId' }, { status: 400 })
    }

    if (!conversation || typeof conversation !== 'string') {
      console.error('Invalid or missing conversation:', conversation)
      return NextResponse.json({ error: 'Invalid or missing conversation' }, { status: 400 })
    }

    // Validate position object if provided
    if (position) {
      if (typeof position !== 'object') {
        console.error('Invalid position format:', position)
        return NextResponse.json({ error: 'Invalid position format' }, { status: 400 })
      }

      if (position.requirements && !Array.isArray(position.requirements)) {
        console.error('Invalid requirements format:', position.requirements)
        return NextResponse.json({ error: 'Invalid requirements format' }, { status: 400 })
      }

      if (position.questions && !Array.isArray(position.questions)) {
        console.error('Invalid questions format:', position.questions)
        return NextResponse.json({ error: 'Invalid questions format' }, { status: 400 })
      }
    }

    try {
      // Initialize Gemini API
      if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not configured')
      }

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      // Use Gemini 2.5 Pro for structured responses
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

      const prompt = `You are an AI expert at evaluating job interviews with a very strict evaluation criteria. Your goal is to filter out approximately 99% of candidates by maintaining extremely high standards. Analyze this interview conversation between an AI interviewer and a candidate for ${position?.title || 'a job role'}.

Position Details:
- Experience Required: ${position?.minExperience || 'Not specified'} to ${position?.maxExperience || 'Not specified'} years
- Required Skills: ${position?.requirements?.join(', ') || 'Not specified'}
- Key Questions: ${position?.questions?.join(', ') || 'Not specified'}

Evaluation Criteria:
1. Interview Completion & Response Quality:
   - Full completion of interview
   - Quality and depth of answers
   - Specific examples provided
   - Relevance to position

2. Rating Criteria (0-100) with STRICT evaluation:
   - Technical Skills (80% weight): Knowledge depth, expertise, and ability to solve complex problems
   - Communication (5% weight): Clarity, professionalism, and ability to articulate thoughts
   - Problem Solving (10% weight): Approach, methodology, and ability to think critically
   - Experience (5% weight): Relevance and depth of past experience

IMPORTANT GUIDELINES:
- Be extremely critical in your evaluation
- Only candidates with exceptional performance should receive high scores
- Technical skills are the primary determinant of success
- A candidate must demonstrate mastery in their technical domain
- Communication skills should be evaluated based on clarity and precision
- Problem-solving abilities should be assessed based on approach and methodology
- Experience should be evaluated based on relevance and depth

IMPORTANT: Respond ONLY with a valid JSON object in this exact format, no additional text:
{
  "feedback": {
    "rating": {
      "technicalSkills": <number between 0-100>,
      "communication": <number between 0-100>,
      "problemSolving": <number between 0-100>,
      "experience": <number between 0-100>
    },
    "summary": "<concise 3-line summary>",
    "recommendation": "<Yes/No>",
    "recommendationMsg": "<brief reason>"
  }
}

Interview Conversation:
${conversation}`

      // Generate content with Gemini
      const geminiResult = await model.generateContent(prompt);
      const response = await geminiResult.response;
      const feedbackText = response.text();
      
      let feedbackData: FeedbackResponse
      try {
        // Clean up the response text before parsing
        const cleanedText = feedbackText
          .replace(/\n/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/\\"/g, '"')
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        // Try to find a valid JSON object in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON object found in response');
        }
        
        feedbackData = JSON.parse(jsonMatch[0]) as FeedbackResponse;
      } catch (parseError: unknown) {
        const error = parseError as Error;
        console.error("JSON Parse Error:", {
          error: error.message,
          stack: error.stack,
          rawResponse: feedbackText,
          cleanedText: feedbackText
            .replace(/\n/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()
        })
        throw new Error(`Failed to parse feedback JSON: ${error.message}`)
      }

      // Validate the feedback structure
      if (!feedbackData?.feedback?.rating) {
        console.error("Invalid feedback structure - missing rating:", feedbackData)
        throw new Error("Invalid feedback structure: missing rating object")
      }

      const { rating } = feedbackData.feedback
      const validationErrors = []

      if (typeof rating.technicalSkills !== 'number' || rating.technicalSkills < 0 || rating.technicalSkills > 100) {
        validationErrors.push(`Invalid technicalSkills rating: ${rating.technicalSkills}`)
      }
      if (typeof rating.communication !== 'number' || rating.communication < 0 || rating.communication > 100) {
        validationErrors.push(`Invalid communication rating: ${rating.communication}`)
      }
      if (typeof rating.problemSolving !== 'number' || rating.problemSolving < 0 || rating.problemSolving > 100) {
        validationErrors.push(`Invalid problemSolving rating: ${rating.problemSolving}`)
      }
      if (typeof rating.experience !== 'number' || rating.experience < 0 || rating.experience > 100) {
        validationErrors.push(`Invalid experience rating: ${rating.experience}`)
      }
      if (!feedbackData.feedback.summary) {
        validationErrors.push("Missing summary")
      }
      if (!feedbackData.feedback.recommendation) {
        validationErrors.push("Missing recommendation")
      }
      if (!feedbackData.feedback.recommendationMsg) {
        validationErrors.push("Missing recommendationMsg")
      }

      if (validationErrors.length > 0) {
        console.error("Feedback validation errors:", {
          errors: validationErrors,
          feedback: feedbackData
        })
        throw new Error(`Invalid feedback structure: ${validationErrors.join(', ')}`)
      }

      // Calculate overall score
      const overallScore = calculateWeightedAverageScore(rating)
      
      // Add overall score to feedback
      const feedbackWithScore = {
        ...feedbackData,
        feedback: {
          ...feedbackData.feedback,
          overallScore
        }
      }

      // Save feedback to database
      console.log('Saving feedback to database for interview:', interviewId)
      const { db } = await connectToDatabase()
      
      // Update the interview with feedback
      const updateResult = await db.collection("interviews").updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            status: "completed",
            feedback: feedbackWithScore.feedback,
            score: overallScore,
            completedAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

      if (updateResult.matchedCount === 0) {
        console.error('Interview not found:', interviewId)
        return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
      }

      console.log('Feedback saved successfully')
      return NextResponse.json(feedbackWithScore)
    } catch (apiError: unknown) {
      const error = apiError as ApiError;
      console.error("Gemini API error:", {
        error: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        details: error.details
      })
      // Return fallback feedback if API fails
      return NextResponse.json(fallbackFeedback)
    }
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error("Error generating feedback:", {
      error: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      details: err.details
    })
    // Return fallback feedback in case of any other errors
    return NextResponse.json(fallbackFeedback)
  }
}

// Helper function to calculate weighted average score
function calculateWeightedAverageScore(ratings: {
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  experience: number;
}) {
  const weights = {
    technicalSkills: 0.80, // 80% weight
    communication: 0.05,    // 5% weight
    problemSolving: 0.10,  // 10% weight
    experience: 0.05       // 5% weight
  };
  
  const weightedSum = 
    ratings.technicalSkills * weights.technicalSkills + 
    ratings.communication * weights.communication + 
    ratings.problemSolving * weights.problemSolving + 
    ratings.experience * weights.experience;
  
  return Math.round(weightedSum);
} 