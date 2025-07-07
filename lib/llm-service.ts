import { logger } from "./logger";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  content: string;
  model: string;
}

interface LLMService {
  chat(messages: ChatMessage[], model: string): Promise<ChatCompletionResponse>;
}

class OpenAIService implements LLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chat(messages: ChatMessage[], model: string): Promise<ChatCompletionResponse> {
    logger.debug(`OpenAIService: Sending chat request to ${this.baseUrl} with model ${model}`);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("OpenAI API error", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    logger.debug("OpenAI API response received", content);
    return { content, model: data.model };
  }
}

class GoogleGeminiService implements LLMService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://generativelanguage.googleapis.com/v1beta") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chat(messages: ChatMessage[], model: string): Promise<ChatCompletionResponse> {
    logger.debug(`GoogleGeminiService: Sending chat request to ${this.baseUrl} with model ${model}`);
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "system" ? "user" : msg.role, // Gemini doesn't have a 'system' role directly in chat
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("Google Gemini API error", errorData);
      throw new Error(`Google Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || "";
    logger.debug("Google Gemini API response received", content);
    return { content, model: data.model };
  }
}

class LMStudioService implements LLMService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:1234") {
    this.baseUrl = baseUrl;
  }

  async chat(messages: ChatMessage[], model: string): Promise<ChatCompletionResponse> {
    logger.debug(`LMStudioService: Sending chat request to ${this.baseUrl} with model ${model}`);
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: -1, // LM Studio often uses -1 for max tokens
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("LM Studio API error", errorData);
      throw new Error(`LM Studio API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    logger.debug("LM Studio API response received", content);
    return { content, model: data.model };
  }
}

// Factory function to get the appropriate LLM service
export function getLLMService(provider: string): LLMService {
  switch (provider) {
    case "openai":
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error("NEXT_PUBLIC_OPENAI_API_KEY is not set in environment variables.");
      }
      return new OpenAIService(process.env.NEXT_PUBLIC_OPENAI_API_KEY, process.env.NEXT_PUBLIC_OPENAI_BASE_URL);
    case "google":
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
        throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
      }
      return new GoogleGeminiService(process.env.NEXT_PUBLIC_GOOGLE_API_KEY, process.env.NEXT_PUBLIC_GOOGLE_BASE_URL);
    case "lmstudio":
      if (!process.env.NEXT_PUBLIC_LMSTUDIO_BASE_URL) {
        throw new Error("NEXT_PUBLIC_LMSTUDIO_BASE_URL is not set in environment variables.");
      }
      return new LMStudioService(process.env.NEXT_PUBLIC_LMSTUDIO_BASE_URL);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export type { ChatMessage, ChatCompletionResponse };