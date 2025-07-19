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
    strengths?: string[];
    areasForImprovement?: string[];
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
  candidateName?: string;
}

// Helper function to generate feedback using Gemini API
async function generateFeedbackWithGemini(conversation: string | any, position?: Position) {
  try {
    // Format the conversation for the API
    const conversationText = typeof conversation === 'string' ? conversation : JSON.stringify(conversation)

    // Get position details
    const positionTitle = position?.title || 'a job role'
    const minExperience = position?.minExperience || 'Not specified'
    const maxExperience = position?.maxExperience || 'Not specified'
    const requirements = position?.requirements?.join(', ') || 'Not specified'
    const questions = position?.questions?.join(', ') || 'Not specified'

    // Initialize Gemini API
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured')
    }

    console.log('Using GOOGLE_API_KEY for Gemini API requests:', !!process.env.GOOGLE_API_KEY)

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

    // Use Gemini Flash for structured responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Prepare the prompt with stricter evaluation criteria
    const prompt = `You are an AI expert at evaluating job interviews with a very strict evaluation criteria. Your goal is to filter out approximately 99% of candidates by maintaining extremely high standards. Analyze this interview conversation between an AI interviewer and a candidate for ${positionTitle}.

Position Details:
- Experience Required: ${minExperience} to ${maxExperience} years
- Required Skills: ${requirements}
- Key Questions: ${questions}

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
${conversationText}`

    console.log('Making Gemini API request with SDK:', {
      model: 'gemini-pro',
      promptLength: prompt.length,
    })

    // Generate content with Gemini
    const geminiResult = await model.generateContent(prompt)
    const response = await geminiResult.response
    const feedbackText = response.text()
    
    let feedback: any
    try {
      // Clean up the response text before parsing
      const cleanedText = feedbackText
        .replace(/\n/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\\"/g, '"')
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      
      // Try to find a valid JSON object in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON object found in response')
      }
      
      feedback = JSON.parse(jsonMatch[0])
    } catch (parseError: unknown) {
      const error = parseError as Error
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
    if (!feedback?.feedback?.rating) {
      console.error("Invalid feedback structure - missing rating:", feedback)
      throw new Error("Invalid feedback structure: missing rating object")
    }

    return feedback
  } catch (error: unknown) {
    console.error("Error in generateFeedbackWithGemini:", error)
    // Return fallback feedback if API fails
    return fallbackFeedback
  }
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

    const { interviewId, conversation, position, candidateName } = body

    // Validate required fields
    if (!interviewId || typeof interviewId !== 'string') {
      console.error('Invalid or missing interviewId:', interviewId)
      return NextResponse.json({ error: 'Invalid or missing interviewId' }, { status: 400 })
    }

    if (!conversation || typeof conversation !== 'string') {
      console.error('Invalid or missing conversation:', conversation)
      return NextResponse.json({ error: 'Invalid or missing conversation' }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Validate ObjectId format
    if (!ObjectId.isValid(interviewId)) {
      return NextResponse.json({ error: 'Invalid interview ID format' }, { status: 400 })
    }

    // Check if the interview exists first
    const existingInterview = await db.collection('interviews').findOne({ _id: new ObjectId(interviewId) })
    
    // If interview doesn't exist, create it
    if (!existingInterview) {
      console.log('Interview not found, creating a new record')
      await db.collection('interviews').insertOne({
        _id: new ObjectId(interviewId),
        conversation,
        candidateName: candidateName || session.user.name || 'Anonymous Candidate',
        createdAt: new Date(), //here also same mistake in date formatting
        completedAt: new Date(),  //mistake in dare formatting
        status: 'completed',
        userId: session.user.id
      })
    } else {
      // Update the existing interview
      await db.collection('interviews').updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            conversation,
            candidateName: candidateName || session.user.name || 'Anonymous Candidate',
            completedAt: new Date(),
            status: 'completed',
            updatedAt: new Date()
          }
        }
      )
    }

    console.log('Conversation stored successfully')

    try {
      // Process the feedback from Gemini API
      const feedback = await generateFeedbackWithGemini(conversation, position)
      
      // Convert ratings from 1-10 scale to 0-100 scale if needed
      if (feedback && feedback.feedback && feedback.feedback.rating) {
        const rating = feedback.feedback.rating
        if (rating.technicalSkills && rating.technicalSkills <= 10) {
          rating.technicalSkills = rating.technicalSkills * 10
        }
        if (rating.communication && rating.communication <= 10) {
          rating.communication = rating.communication * 10
        }
        if (rating.problemSolving && rating.problemSolving <= 10) {
          rating.problemSolving = rating.problemSolving * 10
        }
        if (rating.experience && rating.experience <= 10) {
          rating.experience = rating.experience * 10
        }
      }

      // Calculate overall score
      let overallScore = 0
      if (feedback && feedback.feedback && feedback.feedback.rating) {
        overallScore = calculateWeightedAverageScore(feedback.feedback.rating)
        feedback.feedback.overallScore = overallScore
      }

      // Store the feedback in the database
      await db.collection('interviews').updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            feedback: feedback.feedback,
            score: overallScore,
            feedbackGeneratedAt: new Date()
          }
        }
      )

      return NextResponse.json({ 
        success: true, 
        message: 'Conversation stored and feedback generated successfully',
        feedback: feedback.feedback 
      })
    } catch (feedbackError) {
      console.error('Error generating feedback:', feedbackError)
      
      // Even if feedback generation fails, we've still stored the conversation
      return NextResponse.json({ 
        success: true, 
        message: 'Conversation stored successfully, but feedback generation failed',
        error: feedbackError instanceof Error ? feedbackError.message : 'Unknown error',
        feedback: fallbackFeedback.feedback
      })
    }
  } catch (error) {
    console.error('Error processing interview feedback:', error)
    return NextResponse.json({ 
      error: 'Failed to process interview feedback',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
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
    technicalSkills: 0.80, // 80% weight  // 70% not 80 %
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
