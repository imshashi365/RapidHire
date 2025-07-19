import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { interviewId, conversation, structuredConversation, conversationData, position, candidateName } = await req.json();
    
    // Use structuredConversation if available, otherwise fall back to conversationData
    const conversationStructured = structuredConversation || conversationData || [];

    if (!interviewId || !conversation) {
      return NextResponse.json({ error: "Interview ID and conversation are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Validate ObjectId format
    if (!ObjectId.isValid(interviewId)) {
      return NextResponse.json({ error: "Invalid interview ID format" }, { status: 400 });
    }

    // Check if the interview exists first
    const existingInterview = await db.collection("interviews").findOne({ _id: new ObjectId(interviewId) });
    
    // If interview doesn't exist, create it
    if (!existingInterview) {
      console.log("Interview not found, creating a new record");
      await db.collection("interviews").insertOne({
        _id: new ObjectId(interviewId),
        conversation,
        conversationData: conversationStructured, // Store structured conversation data
        candidateName: candidateName || "Anonymous Candidate",
        createdAt: new Date(),
        completedAt: new Date(),
        status: "completed"
      });
    } else {
      // Update the existing interview
      await db.collection("interviews").updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            conversation,
            conversationData: conversationStructured, // Store structured conversation data
            candidateName: candidateName || "Anonymous Candidate",
            completedAt: new Date(),
            status: "completed"
          }
        }
      );
    }

    console.log("Conversation stored successfully");

    // Generate feedback using Gemini
    try {
      // Format the conversation for the API
      const conversationText = Array.isArray(conversation) 
        ? conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')
        : conversation;

      // Format position data
      const positionInfo = typeof position === 'string' 
        ? position 
        : JSON.stringify(position);

      // Prepare the prompt for Gemini
      const prompt = `
        You are an expert AI recruiter analyzing an interview conversation.
        
        Position: ${positionInfo}
        
        Interview Conversation:
        ${conversationText}
        
        Please provide a comprehensive analysis of this interview with the following:
        
        1. Technical Skills (Rate 1-10): Evaluate the candidate's technical knowledge and skills relevant to the position.
        2. Communication (Rate 1-10): Assess how clearly and effectively the candidate communicates.
        3. Problem Solving (Rate 1-10): Evaluate the candidate's approach to solving problems.
        4. Experience (Rate 1-10): Assess the relevance and depth of the candidate's experience.
        5. Summary: Provide a brief summary of the candidate's performance.
        6. Strengths: List 3-5 key strengths demonstrated in the interview.
        7. Areas for Improvement: List 2-3 areas where the candidate could improve.
        8. Recommendation: Would you recommend hiring this candidate? (Yes/No/Maybe)
        9. Recommendation Justification: Explain your recommendation.
        
        Format your response as a JSON object with these fields.
      `;

      // Call Gemini API using the SDK
      // Use the GOOGLE_API_KEY for Gemini API requests as specified
      const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
      
      console.log("Using GOOGLE_API_KEY for Gemini API requests:", !!GEMINI_API_KEY);
      
      if (!GEMINI_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured. Please check your .env file.");
      }

      console.log('Making Gemini API request with SDK:', {
        model: 'gemini-pro',
        promptLength: prompt.length,
      });
      
      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      // Use Gemini Flash for structured responses
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Generate content with Gemini
      let feedback;
      try {
        const geminiResult = await model.generateContent(prompt);
        const response = await geminiResult.response;
        const feedbackText = response.text();
        
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
          if (jsonMatch) {
            feedback = JSON.parse(jsonMatch[0]);
          } else {
            feedback = { summary: feedbackText };
          }
        } catch (parseError) {
          console.error("Error parsing Gemini response:", parseError);
          feedback = { 
            summary: "Unable to parse feedback. The interview was recorded successfully.",
            error: "Parsing error"
          };
        }
      } catch (sdkError) {
        console.error("Gemini SDK error:", sdkError);
        feedback = { 
          summary: "An error occurred while generating feedback. The interview was recorded successfully.",
          error: sdkError instanceof Error ? sdkError.message : "Unknown SDK error"
        };
      }

      // Store the feedback in the database
      await db.collection("interviews").updateOne(
        { _id: new ObjectId(interviewId) },
        {
          $set: {
            feedback,
            feedbackGeneratedAt: new Date()
          }
        }
      );

      return NextResponse.json({ 
        success: true, 
        message: "Conversation stored and feedback generated successfully",
        feedback 
      });
    } catch (feedbackError) {
      console.error("Error generating feedback:", feedbackError);
      
      // Even if feedback generation fails, we've still stored the conversation
      return NextResponse.json({ 
        success: true, 
        message: "Conversation stored successfully, but feedback generation failed",
        error: feedbackError instanceof Error ? feedbackError.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Error processing interview feedback:", error);
    return NextResponse.json({ 
      error: "Failed to process interview feedback",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
