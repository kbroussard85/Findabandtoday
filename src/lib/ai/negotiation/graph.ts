import { StateGraph, START, END } from "@langchain/langgraph";
import { aiClient } from "../client";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export interface NegotiationHistoryItem {
  actor: 'BAND' | 'VENUE';
  amount: number;
  message: string | unknown;
}

// Define the state for our negotiation graph
export interface NegotiationState {
  gigId: string;
  currentAmount: number;
  status: string;
  history: NegotiationHistoryItem[];
  bandMinRate: number;
  venueMaxBudget: number;
  lastActor: 'BAND' | 'VENUE';
  turnCount: number;
  [key: string]: any;
}

/**
 * Evaluator Node: Decides if the offer is acceptable.
 */
async function evaluateOffer(state: NegotiationState) {
  const { currentAmount, lastActor, bandMinRate, venueMaxBudget } = state;

  // Logical Evaluation
  if (lastActor === 'VENUE' && currentAmount >= bandMinRate) {
    return { status: 'ACCEPTED' };
  }
  if (lastActor === 'BAND' && currentAmount <= venueMaxBudget) {
    return { status: 'ACCEPTED' };
  }

  if (state.turnCount > 5) return { status: 'REJECTED' }; // Prevent infinite loops

  return { status: 'COUNTER_OFFER' };
}

/**
 * Counter-Offer Node: Generates a new price based on preferences.
 */
async function proposeCounter(state: NegotiationState) {
  const { currentAmount, lastActor, bandMinRate, venueMaxBudget } = state;

  let nextAmount = currentAmount;
  if (lastActor === 'VENUE') {
    // Venue offered too low, Band counters
    nextAmount = Math.max(currentAmount * 1.1, bandMinRate);
  } else {
    // Band offered too high, Venue counters
    nextAmount = Math.min(currentAmount * 0.9, venueMaxBudget);
  }

  // Use AI to generate a justification message
  const response = await aiClient.invoke([
    new SystemMessage(`You are an expert negotiator for a ${lastActor === 'VENUE' ? 'Band' : 'Venue'}.`),
    new HumanMessage(`The other party offered $${currentAmount}. We want $${nextAmount.toFixed(0)}. Provide a 1-sentence professional justification.`)
  ]);

  return {
    currentAmount: Math.round(nextAmount),
    history: [...state.history, { actor: lastActor === 'VENUE' ? 'BAND' : 'VENUE', amount: nextAmount, message: response.content }],
    lastActor: lastActor === 'VENUE' ? 'BAND' : 'VENUE',
    turnCount: state.turnCount + 1
  };
}

// Build the graph using a more flexible approach
const workflow = new StateGraph<NegotiationState>({
  channels: {
    gigId: null,
    currentAmount: null,
    status: null,
    history: null,
    bandMinRate: null,
    venueMaxBudget: null,
    lastActor: null,
    turnCount: null,
  }
})
  .addNode("evaluate", evaluateOffer)
  .addNode("counter", proposeCounter)
  .addEdge(START, "evaluate")
  .addConditionalEdges(
    "evaluate",
    (state) => state.status === 'COUNTER_OFFER' ? "counter" : END
  )
  .addEdge("counter", "evaluate");

export const negotiationGraph = workflow.compile();
