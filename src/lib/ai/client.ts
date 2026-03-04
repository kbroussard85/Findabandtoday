import { ChatOpenAI } from "@langchain/openai";

/**
 * Shared AI client for all agentic operations.
 */
export const aiClient = new ChatOpenAI({
  modelName: "gpt-4o-mini", // Cost-effective for basic negotiation
  temperature: 0.2, // Keep responses deterministic and professional
  openAIApiKey: process.env.OPENAI_API_KEY,
});
