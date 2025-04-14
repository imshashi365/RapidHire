import { Interview } from "@/types/interview"

const VAPI_API_KEY = process.env.VAPI_API_KEY
const VAPI_BASE_URL = "https://api.vapi.ai/v1"

export class VapiClient {
  private static instance: VapiClient
  private apiKey: string

  private constructor() {
    if (!VAPI_API_KEY) {
      throw new Error("VAPI_API_KEY is not configured")
    }
    this.apiKey = VAPI_API_KEY
  }

  public static getInstance(): VapiClient {
    if (!VapiClient.instance) {
      VapiClient.instance = new VapiClient()
    }
    return VapiClient.instance
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${VAPI_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Vapi API request failed")
    }

    return response.json()
  }

  public async createInterviewAssistant(interview: Interview) {
    const requirements = interview.position.requirements || []
    const companyName = interview.position.companyName || "Unknown Company"
    
    return this.makeRequest("/assistants", {
      method: "POST",
      body: JSON.stringify({
        name: `Interview Assistant - ${interview.position.title}`,
        model: "gpt-4",
        voice: "alloy",
        systemPrompt: `You are an AI interviewer for the position of ${interview.position.title} at ${companyName}. 
        The job requirements are: ${requirements.join(", ")}.
        Your role is to conduct a professional interview and evaluate the candidate's responses.
        Ask relevant questions and provide feedback based on their answers.
        Keep the conversation natural and engaging.
        Focus on assessing the candidate's skills and experience relevant to the position.
        Provide constructive feedback and ask follow-up questions when needed.`,
      }),
    })
  }

  public async startConversation(assistantId: string) {
    return this.makeRequest("/conversations", {
      method: "POST",
      body: JSON.stringify({
        assistantId,
      }),
    })
  }

  public async sendMessage(conversationId: string, message: string) {
    return this.makeRequest(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message,
      }),
    })
  }

  public async getConversation(conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`)
  }
} 