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

    // Calculate overall score using weighted average
    const weights = {
      technicalSkills: 0.80, // 80% weight
      communication: 0.05,    // 5% weight
      problemSolving: 0.10,  // 10% weight
      experience: 0.05       // 5% weight
    };
    
    const weightedSum = 
      feedback.rating.technicalSkills * weights.technicalSkills + 
      feedback.rating.communication * weights.communication + 
      feedback.rating.problemSolving * weights.problemSolving + 
      feedback.rating.experience * weights.experience;
    
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
      return NextResponse.json(
        { error: "No feedback available" },
        { status: 404 }
      );
    }

    console.log("Found interview with feedback:", interview.feedback);

    // Return the feedback in the expected structure
    const response = {
      feedback: {
        rating: {
          technicalSkills: interview.feedback.rating.technicalSkills,
          communication: interview.feedback.rating.communication,
          problemSolving: interview.feedback.rating.problemSolving,
          experience: interview.feedback.rating.experience
        },
        summary: interview.feedback.summary,
        recommendation: interview.feedback.recommendation,
        recommendationMsg: interview.feedback.recommendationMsg,
        overallScore: interview.feedback.overallScore || interview.score
      }
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