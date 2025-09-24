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
      englishCommunication: 70,
      confidence: 70,
      storytelling: 70,
      customerHandling: 70
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
      englishCommunication: number;
      confidence: number;
      storytelling: number;
      customerHandling: number;
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

    // Prepare the prompt with stricter evaluation criteria
    const prompt = `You are an AI expert specializing in ultra-strict evaluation of sales/customer-facing interview performance. Your mission is to filter out 95-99% of candidates by applying the HIGHEST standards of communication, persuasion, and professionalism. Only exceptional candidates with near-native fluency, high confidence, and strong storytelling should pass.

    Position Details:
    - Role: Sales Executive / Customer Success
    - Experience Required: ${minExperience} to ${maxExperience} years
    - Required Skills: English speaking, communication, confidence, storytelling, customer handling
    - Key Questions: ${questions}
    
    Evaluation Framework:
    1. Interview Completion & Response Quality:
       - Did the candidate answer ALL questions fully and coherently?
       - Were answers well-structured, fluent, and professional?
       - Was the candidate consistently confident (no hesitation, filler words, or broken sentences)?
       - Did they demonstrate persuasive storytelling and real customer-facing presence?
       - Were answers aligned with real-world client challenges and SaaS product sales?
    
    2. STRICT Scoring Rubric (0–100 scale):
       - English Fluency & Communication (40% weight):
         * Must show flawless grammar, natural flow, and professional articulation
         * Broken English, long pauses, or unclear phrases = automatic low score
       - Confidence & Presence (25% weight):
         * Strong voice, assertiveness, and conviction in delivery required
         * Hesitation, “um/uh/sorry” = very low score
       - Storytelling & Persuasion (25% weight):
         * Must use engaging, persuasive, and structured examples
         * Bland or mechanical answers = near-zero score
       - Customer Handling Relevance (10% weight):
         * Must show empathy, problem-solving, and SaaS-specific client handling
         * Generic/unrelated answers = very low score
    
    3. Pass/Fail Logic:
       - Candidates scoring below 70 in ANY category are automatically rejected
       - Only candidates with total weighted average ≥85 AND no major weaknesses should receive a "Yes"
       - Recommendation must be binary: "Yes" or "No" with no soft approvals
    
    Output Format:
    Respond ONLY with a valid JSON object in this exact structure, no additional text:
    {
      "feedback": {
        "rating": {
          "englishCommunication": <number 0-100>,
          "confidence": <number 0-100>,
          "storytelling": <number 0-100>,
          "customerHandling": <number 0-100>
        },
        "summary": "<concise 3-line brutally honest summary>",
        "recommendation": "<Yes/No>",
        "recommendationMsg": "<one-line decisive reason>"
      }
    }
    
    Interview Conversation:
    ${conversationText}`


    console.log('Making Gemini API request with SDK:', {
      model: 'gemini-2.5-pro',
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
      if (feedback?.feedback?.rating) {
        const rating = feedback.feedback.rating
        if (rating.englishCommunication && rating.englishCommunication <= 10) {
          rating.englishCommunication = rating.englishCommunication * 10
        }
        if (rating.confidence && rating.confidence <= 10) {
          rating.confidence = rating.confidence * 10
        }
        if (rating.storytelling && rating.storytelling <= 10) {
          rating.storytelling = rating.storytelling * 10
        }
        if (rating.customerHandling && rating.customerHandling <= 10) {
          rating.customerHandling = rating.customerHandling * 10
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
  englishCommunication: number;
  confidence: number;
  storytelling: number;
  customerHandling: number;
}) {
  const weights = {
    englishCommunication: 0.40, // 40% weight
    confidence: 0.25,          // 25% weight
    storytelling: 0.25,        // 25% weight
    customerHandling: 0.10     // 10% weight
  };

  const weightedSum =
    ratings.englishCommunication * weights.englishCommunication +
    ratings.confidence * weights.confidence +
    ratings.storytelling * weights.storytelling +
    ratings.customerHandling * weights.customerHandling;

  return Math.round(weightedSum);
} 
