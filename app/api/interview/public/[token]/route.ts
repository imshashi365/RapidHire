import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Add detailed logging and validation to the GET handler
export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;

    if (!token) {
      console.error("Missing interview ID in request parameters.");
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    console.log(`Fetching interview with ID: ${token}`);

    // Validate ObjectId format
    if (!ObjectId.isValid(token)) {
      console.error(`Invalid ObjectId format: ${token}`);
      return NextResponse.json({ error: "Invalid interview ID format" }, { status: 400 });
    }

    // Fetch the public interview details
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(token),
      isPublic: true,
    });

    if (!interview) {
      console.error(`Interview not found or not public for ID: ${token}`);
      return NextResponse.json({ error: "Interview not found or not public" }, { status: 404 });
    }

    console.log(`Interview found: ${JSON.stringify(interview)}`);
    return NextResponse.json({ success: true, interview });
  } catch (error) {
    console.error("Error fetching public interview:", error);
    return NextResponse.json({ error: "Failed to fetch public interview" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    const { question, answer, questionNumber } = await req.json();

    if (!token || !question || !answer) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Verify the interview exists and is public
    const interview = await db.collection("interviews").findOne({
      _id: new ObjectId(token),
      isPublic: true,
    });

    if (!interview) {
      return NextResponse.json({ error: "Invalid interview session" }, { status: 404 });
    }

    // Store the answer
    const answerData = {
      question,
      answer,
      questionNumber,
      createdAt: new Date(),
    };

    await db.collection("interviews").updateOne(
      { _id: new ObjectId(token) },
      {
        $push: { answers: answerData } as any,
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({ success: true, message: "Answer saved successfully" });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}

// Example usage of fetching public interview data
fetch('/api/interview/public/...')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching interview data:', error));