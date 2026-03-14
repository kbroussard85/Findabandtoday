/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Custom Gemini wrapper that mimics LangChain's .invoke() 
 * to maintain compatibility with existing agents without refactoring.
 */
class GeminiChatModel {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = "gemini-1.5-pro") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async invoke(messages: any[]) {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    // Extract system instruction and regular messages
    const systemInstruction = messages.find(m => m.role === 'system' || m._getType?.() === 'system')?.content;
    const userMessages = messages.filter(m => m.role !== 'system' && m._getType?.() !== 'system');

    // Simple text concatenation for prompt if not using chat history
    const prompt = userMessages.map(m => m.content).join("\n\n");

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
    });

    const responseText = result.response.text();

    return {
      content: responseText,
      additional_kwargs: {},
    };
  }
}

const geminiKey = process.env.GEMINI_API_KEY;
const isMockEnabled = !geminiKey;

if (isMockEnabled && process.env.NODE_ENV === 'production') {
  console.warn('[AI] CRITICAL: Gemini API Key is missing in production!');
}

/**
 * Shared AI client for all agentic operations (Maximizer, Outreach, Liaison).
 * Now migrated to Gemini 1.5 Pro.
 */
export const aiClient = isMockEnabled
  ? { 
      invoke: async () => ({ content: "AI Mock Response: Key Missing", additional_kwargs: {} }) 
    } as any
  : new GeminiChatModel(geminiKey);
