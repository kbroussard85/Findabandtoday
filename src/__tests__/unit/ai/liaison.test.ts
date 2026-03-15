import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draftLiaisonOffer } from '@/lib/ai/agents/liaison';
import { aiClient } from '@/lib/ai/client';

vi.mock('@/lib/ai/client', () => ({
  aiClient: {
    invoke: vi.fn(),
  },
}));

describe('AI Liaison Agent Unit Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draft a professional offer for a Band', async () => {
    (aiClient.invoke as any).mockResolvedValue({
      content: 'Mocked professional pitch from band to venue.',
    });

    const params = {
      senderType: 'BAND' as const,
      senderProfile: {
        name: 'The Rockers',
        bio: 'A great rock band.',
      },
      recipientProfile: {
        name: 'The Blue Note',
      },
      gigDetails: {
        date: new Date('2026-06-20'),
        suggestedAmount: 500,
        message: 'Let us rock your venue!',
      },
    };

    const result = await draftLiaisonOffer(params);

    expect(aiClient.invoke).toHaveBeenCalled();
    expect(result).toContain('Mocked professional pitch');
    
    // Verify system prompt contains correct role
    const callArgs = (aiClient.invoke as any).mock.calls[0][0];
    expect(callArgs[0].content).toContain('representing the band "The Rockers"');
  });

  it('should draft a professional offer for a Venue', async () => {
    (aiClient.invoke as any).mockResolvedValue({
      content: 'Mocked professional offer from venue to band.',
    });

    const params = {
      senderType: 'VENUE' as const,
      senderProfile: {
        name: 'The Blue Note',
      },
      recipientProfile: {
        name: 'The Rockers',
      },
      gigDetails: {
        date: new Date('2026-06-20'),
        suggestedAmount: 600,
      },
    };

    const result = await draftLiaisonOffer(params);

    expect(aiClient.invoke).toHaveBeenCalled();
    expect(result).toContain('Mocked professional offer');
    
    // Verify system prompt contains correct role
    const callArgs = (aiClient.invoke as any).mock.calls[0][0];
    expect(callArgs[0].content).toContain('talent booker for the venue "The Blue Note"');
  });
});
