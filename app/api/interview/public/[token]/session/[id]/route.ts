import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: { token: string; id: string } }) {
  try {
    const { token, id } = params;
    console.log("Fetching interview with token:", token, "and id:", id);

    if (!token || !id) {
      console.error("Missing required parameters: token or id");
      return NextResponse.json({ error: "Token and ID are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      console.error("Invalid ObjectId format:", id);
      return NextResponse.json({ error: "Invalid interview ID format" }, { status: 400 });
    }

    // Log available collections to debug
    const collections = await db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Check if the interviews collection exists
    if (!collections.some(c => c.name === "interviews")) {
      console.error("Interviews collection does not exist");
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 });
    }

    // Try to find the interview by ID and any token field
    // This approach is more flexible and will match regardless of token field name
    let interview = await db.collection("interviews").findOne({
      _id: new ObjectId(id),
      $or: [
        { isPublic: true },
        { token: token },
        { publicToken: token }
      ]
    });

    if (!interview) {
      console.error("Interview not found with ID:", id, "and token:", token);
      
      // For debugging, try to find the interview just by ID to see if it exists at all
      const interviewById = await db.collection("interviews").findOne({
        _id: new ObjectId(id)
      });
      
      if (interviewById) {
        console.log("Interview exists but may not be public or have matching token");
        console.log("Interview data (partial):", {
          isPublic: interviewById.isPublic,
          hasToken: !!interviewById.token,
          hasPublicToken: !!interviewById.publicToken
        });
      } else {
        console.log("No interview found with this ID at all");
      }
      
      return NextResponse.json({ error: "Interview session not found or not accessible" }, { status: 404 });
    }

    console.log("Interview found:", interview._id.toString());
    
    // Ensure the interview has the necessary fields
    if (!interview.position && interview.positionId) {
      try {
        // Try to fetch position data if it's missing
        const position = await db.collection("positions").findOne({
          _id: new ObjectId(interview.positionId)
        });
        
        if (position) {
          interview.position = position;
          console.log("Added position data to interview");
        }
      } catch (positionError) {
        console.error("Error fetching position data:", positionError);
        // Continue without position data
      }
    }
    
    return NextResponse.json({ success: true, interview });
  } catch (error) {
    console.error("Error fetching interview session:", error);

    // Ensure the error response is always in JSON format
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}