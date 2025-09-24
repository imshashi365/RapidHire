import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const interviewId = resolvedParams.id;
    
    // Parse request body
    const body = await request.json();
    const { feedback } = body;

    if (!interviewId || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate overall score using weighted average with new categories
    const weights = {
      englishCommunication: 0.40, // 40% weight
      confidence: 0.30,          // 30% weight
      storytelling: 0.15,        // 15% weight
      customerHandling: 0.15     // 15% weight
    };
    
    const weightedSum = 
      feedback.rating.englishCommunication * weights.englishCommunication + 
      feedback.rating.confidence * weights.confidence + 
      feedback.rating.storytelling * weights.storytelling + 
      feedback.rating.customerHandling * weights.customerHandling;
    
    const overallScore = Math.round(weightedSum);

    // Add overall score to feedback object
    const feedbackWithScore = {
      ...feedback,
      overallScore
    };

    // Connect to database
    const { db } = await connectToDatabase();

    // Update the interview record with feedback and overall score
    const result = await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status: "completed",
          feedback: feedbackWithScore,
          score: overallScore,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const interviewId = resolvedParams.id;
    console.log("Fetching feedback for interview ID:", interviewId);
    
    if (!interviewId) {
      console.log("Missing interview ID");
      return NextResponse.json(
        { error: "Missing interview ID" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(interviewId)) {
      console.log("Invalid interview ID format:", interviewId);
      return NextResponse.json(
        { error: "Invalid interview ID format" },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("Connected to database");

    // Find the interview and get its feedback
    console.log("Finding interview...");
    const interview = await db.collection("interviews").findOne(
      { _id: new ObjectId(interviewId) }
    );

    if (!interview) {
      console.log("Interview not found");
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (!interview.feedback) {
      console.log("No feedback available for interview");
      // Check if we have structured conversation data even without feedback
      const conversationData = interview.conversationData || [];
      // Return an empty feedback structure instead of an error
      return NextResponse.json({
        feedback: {
          rating: {
            englishCommunication: 0,
            confidence: 0,
            storytelling: 0,
            customerHandling: 0
          },
          summary: "Feedback not yet available for this interview.",
          recommendation: "Pending",
          recommendationMsg: "Feedback generation is pending or not available.",
          overallScore: 0
        },
        status: "pending",
        conversation: interview.conversation || "",
        conversationData: conversationData
      });
    }

    console.log("Found interview with feedback:", interview.feedback);

    // Check if we have structured conversation data
    const conversationData = interview.conversationData || [];
    
    // Create a safe feedback structure with fallbacks for missing data
    // First check if the feedback has the expected structure
    const hasFeedbackRating = interview.feedback && 
                              interview.feedback.rating && 
                              typeof interview.feedback.rating === 'object';
    
    // Return the feedback in the expected structure with fallbacks
    const response = {
      feedback: {
        rating: {
          englishCommunication: hasFeedbackRating ? (interview.feedback.rating.englishCommunication || 0) : 0,
          confidence: hasFeedbackRating ? (interview.feedback.rating.confidence || 0) : 0,
          storytelling: hasFeedbackRating ? (interview.feedback.rating.storytelling || 0) : 0,
          customerHandling: hasFeedbackRating ? (interview.feedback.rating.customerHandling || 0) : 0
        },
        summary: interview.feedback.summary || "No detailed feedback available.",
        recommendation: interview.feedback.recommendation || "Pending",
        recommendationMsg: interview.feedback.recommendationMsg || "Feedback details not available.",
        overallScore: interview.feedback.overallScore || interview.score || 0
      },
      status: interview.status || "completed",
      conversation: interview.conversation || "",
      conversationData: conversationData
    };

    console.log("Returning feedback response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
} 