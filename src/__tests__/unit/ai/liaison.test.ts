import { describe, it, expect, vi } from 'vitest';
import { draftLiaisonOffer } from '@/lib/ai/agents/liaison';

describe('AI Liaison Agent', () => {
  const mockSenderProfile = {
    name: 'The Rockers',
    bio: 'A high-energy rock band.',
    negotiationPrefs: {}
  };

  const mockRecipientProfile = {
    name: 'The Blue Note',
    bio: 'A classic jazz and rock venue.'
  };

  const mockGigDetails = {
    date: new Date('2026-06-01'),
    suggestedAmount: 500,
    message: 'We would love to play at your venue!'
  };

  it('should draft a professional offer for a BAND sender', async () => {
    const result = await draftLiaisonOffer({
      senderType: 'BAND',
      senderProfile: mockSenderProfile,
      recipientProfile: mockRecipientProfile,
      gigDetails: mockGigDetails
    });

    expect(result).toBeTypeOf('string');
    expect(result).toContain('The FABT Liaison');
    expect(result).toContain('Venue');
  });

  it('should draft a professional offer for a VENUE sender', async () => {
    const result = await draftLiaisonOffer({
      senderType: 'VENUE',
      senderProfile: { ...mockRecipientProfile, negotiationPrefs: {} },
      recipientProfile: mockSenderProfile,
      gigDetails: mockGigDetails
    });

    expect(result).toBeTypeOf('string');
    expect(result).toContain('The FABT Liaison');
  });

  it('should include venue agreement text when provided', async () => {
    const venueAgreementText = 'Must provide own PA system.';
    const result = await draftLiaisonOffer({
      senderType: 'BAND',
      senderProfile: mockSenderProfile,
      recipientProfile: mockRecipientProfile,
      gigDetails: mockGigDetails,
      venueAgreementText
    });

    expect(result).toBeTypeOf('string');
    expect(result).toContain('The FABT Liaison');
  });
});
