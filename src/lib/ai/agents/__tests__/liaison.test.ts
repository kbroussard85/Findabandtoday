/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { draftLiaisonOffer } from '../liaison';
import { aiClient } from '../../client';
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

vi.mock('../../client', () => ({
  aiClient: {
    invoke: vi.fn(),
  },
}));

describe('AI Liaison Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draft an offer representing a BAND', async () => {
    const params = {
      senderType: 'BAND' as const,
      senderProfile: { name: 'The Rockers', bio: 'A cool rock band' },
      recipientProfile: { name: 'Rock Club' },
      gigDetails: {
        date: new Date('2026-05-20'),
        suggestedAmount: 500,
        message: 'We want to play!',
      },
    };

    (aiClient.invoke as any).mockResolvedValue({ content: 'Mocked AI Response' });

    const result = await draftLiaisonOffer(params);

    expect(aiClient.invoke).toHaveBeenCalledWith([
      expect.any(SystemMessage),
      expect.any(HumanMessage),
    ]);

    const calls = (aiClient.invoke as any).mock.calls[0][0];
    expect(calls[0].content).toContain('representing the band "The Rockers"');
    expect(calls[1].content).toContain('Sender: The Rockers');
    expect(calls[1].content).toContain('Recipient: Rock Club');
    expect(result).toBe('Mocked AI Response');
  });

  it('should draft an offer representing a VENUE', async () => {
    const params = {
      senderType: 'VENUE' as const,
      senderProfile: { name: 'Jazz Bar', bio: 'Classic jazz venue' },
      recipientProfile: { name: 'Miles Davis Tribute' },
      gigDetails: {
        date: new Date('2026-06-15'),
        suggestedAmount: 300,
      },
      venueAgreementText: 'No loud drumming after 11 PM',
    };

    (aiClient.invoke as any).mockResolvedValue({ content: 'Mocked Venue Offer' });

    await draftLiaisonOffer(params);

    const calls = (aiClient.invoke as any).mock.calls[0][0];
    expect(calls[0].content).toContain('booker for the venue "Jazz Bar"');
    expect(calls[1].content).toContain('Venue Contract Clauses: No loud drumming after 11 PM');
  });
});
