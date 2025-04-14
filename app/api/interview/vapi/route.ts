import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { VapiClient } from "@/lib/vapi"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, interviewId, conversationId, assistantId } = await req.json()
    
    if (!message || !interviewId) {
      return NextResponse.json(
        { error: "Message and interview ID are required" },
        { status: 400 }
      )
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get interview details from database
    const interview = await db.collection("interviews").findOne({ 
      _id: new ObjectId(interviewId) 
    })
    
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      )
    }

    // Initialize Vapi client
    const vapi = VapiClient.getInstance()

    let response
    if (!assistantId) {
      // Create new assistant and start conversation
      const assistant = await vapi.createInterviewAssistant(interview)
      const conversation = await vapi.startConversation(assistant.id)
      response = await vapi.sendMessage(conversation.id, message)
      
      return NextResponse.json({
        response: response.message,
        conversationId: conversation.id,
        assistantId: assistant.id,
      })
    } else if (!conversationId) {
      // Start new conversation with existing assistant
      const conversation = await vapi.startConversation(assistantId)
      response = await vapi.sendMessage(conversation.id, message)
      
      return NextResponse.json({
        response: response.message,
        conversationId: conversation.id,
        assistantId,
      })
    } else {
      // Continue existing conversation
      response = await vapi.sendMessage(conversationId, message)
      
      return NextResponse.json({
        response: response.message,
        conversationId,
        assistantId,
      })
    }
  } catch (error) {
    console.error("Error in Vapi integration:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process interview message" },
      { status: 500 }
    )
  }
} 