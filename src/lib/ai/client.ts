import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";

/**
 * Mock AI Client for development when API keys are missing or quota is exceeded.
 */
class MockChatOpenAI extends BaseChatModel {
  _llmType() { return "mock"; }
  async _generate() {
    return {
      generations: [{
        text: JSON.stringify(["id1", "id2", "id3"]), // Default mock for Maximizer
        message: new AIMessage("This is a mock AI response for development.")
      }]
    };
  }
}

const isMockEnabled = !process.env.OPENAI_API_KEY;

/**
 * Shared AI client for all agentic operations.
 */
export const aiClient = isMockEnabled 
  ? new MockChatOpenAI({}) as unknown as ChatOpenAI
  : new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.2,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

