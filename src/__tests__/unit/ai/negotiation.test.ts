import { describe, it, expect, vi, beforeEach } from 'vitest';
import { negotiationGraph } from '@/lib/ai/negotiation/graph';
import { aiClient } from '@/lib/ai/client';

vi.mock('@/lib/ai/client', () => ({
  aiClient: {
    invoke: vi.fn(),
  },
}));

describe('Negotiation Graph Unit Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept an offer immediately if it meets the minimum rate', async () => {
    const initialState = {
      gigId: 'gig-1',
      currentAmount: 500,
      status: 'OFFER_SENT',
      history: [],
      bandMinRate: 400,
      venueMaxBudget: 1000,
      lastActor: 'VENUE' as const,
      turnCount: 0,
    };

    const finalState = await negotiationGraph.invoke(initialState);

    expect(finalState.status).toBe('ACCEPTED');
    expect(aiClient.invoke).not.toHaveBeenCalled(); // No counter needed
  });

  it('should counter-offer if the venue offer is too low', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (aiClient.invoke as any).mockResolvedValue({
      content: 'We need a bit more to cover travel costs.',
    });

    const initialState = {
      gigId: 'gig-1',
      currentAmount: 300,
      status: 'OFFER_SENT',
      history: [],
      bandMinRate: 500,
      venueMaxBudget: 1000,
      lastActor: 'VENUE' as const,
      turnCount: 0,
    };

    const finalState = await negotiationGraph.invoke(initialState);

    // Should counter once and then accept if counter reaches minRate
    // In this logic: 300 * 1.1 = 330, then 330 * 1.1 = 363 ... until 500
    expect(finalState.status).toBe('ACCEPTED');
    expect(finalState.currentAmount).toBeGreaterThanOrEqual(500);
    expect(aiClient.invoke).toHaveBeenCalled();
  });

  it('should reject if too many turns pass without agreement', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (aiClient.invoke as any).mockResolvedValue({
      content: 'Still too low.',
    });

    const initialState = {
      gigId: 'gig-1',
      currentAmount: 100,
      status: 'OFFER_SENT',
      history: [],
      bandMinRate: 1000, // Impossible to reach in 5 turns
      venueMaxBudget: 1000,
      lastActor: 'VENUE' as const,
      turnCount: 0,
    };

    const finalState = await negotiationGraph.invoke(initialState);

    expect(finalState.status).toBe('REJECTED');
  });
});
