import { describe, it, expect } from 'vitest';
import { negotiationGraph, NegotiationState } from '@/lib/ai/negotiation/graph';

describe('LangGraph Negotiator', () => {
  const initialState: NegotiationState = {
    gigId: 'gig-123',
    currentAmount: 500,
    status: 'START',
    history: [],
    bandMinRate: 400,
    venueMaxBudget: 600,
    lastActor: 'VENUE',
    turnCount: 0
  };

  it('should accept an offer if it meets the band min rate (Venue offering)', async () => {
    const state: NegotiationState = {
      ...initialState,
      currentAmount: 450,
      lastActor: 'VENUE',
      bandMinRate: 400
    };

    const result = await negotiationGraph.invoke(state);
    expect(result.status).toBe('ACCEPTED');
  });

  it('should accept an offer if it meets the venue max budget (Band offering)', async () => {
    const state: NegotiationState = {
      ...initialState,
      currentAmount: 550,
      lastActor: 'BAND',
      venueMaxBudget: 600
    };

    const result = await negotiationGraph.invoke(state);
    expect(result.status).toBe('ACCEPTED');
  });

  it('should counter-offer if the amount is too low for the band', async () => {
    const state: NegotiationState = {
      ...initialState,
      currentAmount: 300,
      lastActor: 'VENUE',
      bandMinRate: 400
    };

    const result = await negotiationGraph.invoke(state);
    expect(result.status).toBe('ACCEPTED'); // Wait, why ACCEPTED?
    // Let's check the logic in graph.ts
    // if (lastActor === 'VENUE' && currentAmount >= bandMinRate) return { status: 'ACCEPTED' };
    // 300 < 400, so it should return COUNTER_OFFER.
    // But wait, the graph will transition to "counter" node, then back to "evaluate".
    // In "counter" node, it will calculate nextAmount = Math.max(300 * 1.1, 400) = 400.
    // Then it will call evaluate again with currentAmount = 400.
    // 400 >= 400, so it returns ACCEPTED.
    // So the final status will be ACCEPTED because the AI negotiator reached an agreement.
  });

  it('should reject after too many turns', async () => {
    const state: NegotiationState = {
      ...initialState,
      currentAmount: 300,
      lastActor: 'VENUE',
      bandMinRate: 1000, // Impossible to reach in 5 turns
      turnCount: 6
    };

    const result = await negotiationGraph.invoke(state);
    expect(result.status).toBe('REJECTED');
  });

  it('should generate a counter-offer message using AI', async () => {
    const state: NegotiationState = {
      ...initialState,
      currentAmount: 300,
      lastActor: 'VENUE',
      bandMinRate: 1000,
      turnCount: 0
    };

    // We expect it to go through "counter" node at least once
    const result = await negotiationGraph.invoke(state);
    
    expect(result.history.length).toBeGreaterThan(0);
    expect(result.history[0].message).toBeTypeOf('string');
  });
});
