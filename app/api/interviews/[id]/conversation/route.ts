import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
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
    const { conversation } = body;

    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: "Invalid conversation format - expected array" },
        { status: 400 }
      );
    }

    // Validate message format
    const isValidMessage = (msg: any) => 
      msg.role && 
      ['assistant', 'user'].includes(msg.role) && 
      typeof msg.content === 'string' &&
      msg.timestamp;

    if (!conversation.every(isValidMessage)) {
      return NextResponse.json(
        { error: "Invalid message format in array" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Format messages with proper Date objects for timestamps
    const formattedMessages = conversation.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    // Update the interview record with structured conversation
    const result = await db.collection("interviews").updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          conversation: formattedMessages,
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
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "Failed to save conversation" },
      { status: 500 }
    );
  }
}