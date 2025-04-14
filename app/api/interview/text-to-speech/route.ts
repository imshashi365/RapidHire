import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!process.env.VAPI_KEY) {
      console.error("VAPI_KEY is not configured in environment variables")
      return NextResponse.json(
        { error: "Text-to-speech service not configured" },
        { status: 500 }
      )
    }

    console.log("Making request to VAPI with text:", text.substring(0, 50) + "...")

    const response = await fetch("https://api.voice.rest/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VAPI_KEY}`
      },
      body: JSON.stringify({
        text,
        voice: "en-US-JennyNeural", // Microsoft Azure voice
        speed: 1.0,
        pitch: 1.0,
        language: "en-US",
        format: "mp3",
        quality: "high"
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error("VAPI Error Response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(
        errorData?.message || `VAPI request failed with status ${response.status}`
      )
    }

    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString()
      }
    })
  } catch (error) {
    console.error("Text-to-speech error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate speech",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 