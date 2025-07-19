import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    // Get the interviewId from the URL
    const url = new URL(req.url);
    const interviewId = url.searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(interviewId)) {
      return NextResponse.json({ error: "Invalid interview ID format" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Fetch the interview with feedback
    const interview = await db.collection("interviews").findOne(
      { _id: new ObjectId(interviewId) },
      { projection: { feedback: 1, candidateName: 1, position: 1, completedAt: 1 } }
    );

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Return the feedback data
    return NextResponse.json({
      success: true,
      feedback: interview.feedback || null,
      candidateName: interview.candidateName,
      position: interview.position,
      completedAt: interview.completedAt
    });
  } catch (error) {
    console.error("Error fetching interview feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview feedback" },
      { status: 500 }
    );
  }
}
