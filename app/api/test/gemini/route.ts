import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    // Get API key from environment variables
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured in environment variables" },
        { status: 500 }
      );
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    
    // Get the model - use the correct model name
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });
    
    // Simple prompt to test if Gemini is working
    const prompt = "Hello, please respond with a simple JSON object with the following fields: status: 'success', message: 'Gemini API is working correctly'";
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Return the raw response from Gemini
    return NextResponse.json({
      status: "success",
      apiResponse: text,
      message: "Gemini API test completed successfully"
    });
  } catch (error: any) {
    console.error("Gemini API test error:", error);
    
    // Return detailed error information
    return NextResponse.json(
      { 
        status: "error",
        message: "Failed to connect to Gemini API",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
