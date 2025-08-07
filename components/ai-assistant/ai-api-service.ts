// AI API Service for integrating with OpenAI or Mistral

interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ContentSummaryRequest {
  content: string
  type: "video" | "article" | "course"
  language?: string
}

interface ImageAnalysisRequest {
  imageUrl: string
  language?: string
}

interface RecommendationRequest {
  userProfile: {
    completedCourses: number
    currentLevel: string
    interests: string[]
    culturalBackground?: string
  }
  language?: string
}

class AIAPIService {
  private apiKey: string | null = null
  private provider: "openai" | "mistral" | null = null
  private baseUrl = ""

  constructor() {
    // Initialize with environment variables or user settings
    this.apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || null
    this.provider = (process.env.NEXT_PUBLIC_AI_PROVIDER as "openai" | "mistral") || null
    this.setProvider(this.provider)
  }

  setApiKey(key: string) {
    this.apiKey = key
  }

  setProvider(provider: "openai" | "mistral" | null) {
    this.provider = provider
    switch (provider) {
      case "openai":
        this.baseUrl = "https://api.openai.com/v1"
        break
      case "mistral":
        this.baseUrl = "https://api.mistral.ai/v1"
        break
      default:
        this.baseUrl = ""
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<AIResponse> {
    if (!this.apiKey || !this.provider) {
      throw new Error("AI service not configured. Please set API key and provider.")
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.provider === "openai") {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    } else if (this.provider === "mistral") {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (this.provider === "openai") {
        return {
          content: result.choices[0].message.content,
          usage: result.usage,
        }
      } else if (this.provider === "mistral") {
        return {
          content: result.choices[0].message.content,
          usage: result.usage,
        }
      }

      throw new Error("Unsupported provider")
    } catch (error) {
      console.error("AI API Error:", error)
      throw error
    }
  }

  async chatCompletion(messages: ChatMessage[], language = "en"): Promise<AIResponse> {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a helpful AI assistant for the Diaspora Market Hub platform. You help users with learning, cultural insights, and personal growth. Always respond in ${language === "en" ? "English" : this.getLanguageName(language)}. Be culturally sensitive and supportive of diaspora experiences.`,
    }

    const data = {
      model: this.provider === "openai" ? "gpt-4" : "mistral-large-latest",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    }

    return this.makeRequest("/chat/completions", data)
  }

  async summarizeContent(request: ContentSummaryRequest): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are an expert content summarizer. Create concise, informative summaries that highlight key learning points. Respond in ${request.language === "en" ? "English" : this.getLanguageName(request.language || "en")}.`,
      },
      {
        role: "user",
        content: `Please summarize this ${request.type} content and provide key learning points:\n\n${request.content}`,
      },
    ]

    return this.chatCompletion(messages, request.language)
  }

  async analyzeImage(request: ImageAnalysisRequest): Promise<AIResponse> {
    if (this.provider !== "openai") {
      throw new Error("Image analysis is currently only supported with OpenAI GPT-4 Vision")
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert in visual analysis, art, and cultural studies. Analyze images with attention to cultural context, artistic techniques, and educational value. Respond in ${request.language === "en" ? "English" : this.getLanguageName(request.language || "en")}.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this image and provide insights about its cultural significance, artistic elements, and any educational value.",
          },
          {
            type: "image_url",
            image_url: {
              url: request.imageUrl,
            },
          },
        ],
      },
    ]

    const data = {
      model: "gpt-4-vision-preview",
      messages,
      max_tokens: 1000,
    }

    return this.makeRequest("/chat/completions", data)
  }

  async generateRecommendations(request: RecommendationRequest): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a personalized learning recommendation engine for diaspora communities. Consider cultural background, learning style, and personal interests when making suggestions. Respond in ${request.language === "en" ? "English" : this.getLanguageName(request.language || "en")}.`,
      },
      {
        role: "user",
        content: `Based on this user profile, recommend learning content:
        - Completed courses: ${request.userProfile.completedCourses}
        - Current level: ${request.userProfile.currentLevel}
        - Interests: ${request.userProfile.interests.join(", ")}
        - Cultural background: ${request.userProfile.culturalBackground || "Not specified"}
        
        Please provide 3-5 specific recommendations with explanations.`,
      },
    ]

    return this.chatCompletion(messages, request.language)
  }

  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      en: "English",
      nl: "Dutch",
      fr: "French",
      es: "Spanish",
      de: "German",
      pt: "Portuguese",
      ar: "Arabic",
      zh: "Chinese",
    }
    return languages[code] || "English"
  }
}

export const aiApiService = new AIAPIService()
