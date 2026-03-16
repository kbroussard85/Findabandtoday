/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getMaximizerSuggestions } from '@/lib/ai/agents/maximizer';
import { getMaximizerMatches } from '@/lib/maximizer';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    venue: {
      findNearby: vi.fn(),
      findMany: vi.fn(),
    },
    band: {
      findNearby: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('Maximizer Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'user-1',
    role: 'BAND',
    bandProfile: { name: 'The Rockers', bio: 'A rock band.', minPayoutRequirement: 500 },
    venueProfile: null
  };

  const mockOpportunities = [
    { id: 'venue-1', name: 'The Blue Note', bio: 'Jazz club.' },
    { id: 'venue-2', name: 'Rock Arena', bio: 'Big stadium.' },
    { id: 'venue-3', name: 'Jazz Cellar', bio: 'Intimate jazz.' }
  ];

  describe('getMaximizerSuggestions (AI)', () => {
    it('should rank opportunities for a BAND user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked((prisma.venue as any).findNearby).mockResolvedValue(mockOpportunities);

      const result = await getMaximizerSuggestions('auth0-123', 40.7128, -74.0060);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('venue-1'); // Based on llm-responses.json: ["venue-1", "venue-2", "venue-3"]
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { auth0Id: 'auth0-123' }
      }));
    });

    it('should rank opportunities for a VENUE user', async () => {
      const venueUser = {
        ...mockUser,
        role: 'VENUE',
        bandProfile: null,
        venueProfile: { name: 'The Blue Note', bio: 'Jazz club.', minPayoutRequirement: 500 }
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(venueUser as any);
      vi.mocked((prisma.band as any).findNearby).mockResolvedValue(mockOpportunities);

      const result = await getMaximizerSuggestions('auth0-456', 40.7128, -74.0060);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('venue-1');
    });

    it('should return empty array if no opportunities found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked((prisma.venue as any).findNearby).mockResolvedValue([]);

      const result = await getMaximizerSuggestions('auth0-123', 40.7128, -74.0060);

      expect(result).toEqual([]);
    });

    it('should fallback to slice(0, 3) if AI response is invalid JSON', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked((prisma.venue as any).findNearby).mockResolvedValue(mockOpportunities);

      // We can't easily change the MSW response per test without resetHandlers
      // But we can use server.use() to override for this test
      const { server } = await import('../../mocks/server');
      const { http, HttpResponse } = await import('msw');
      
      server.use(
        http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', () => {
          return HttpResponse.json({
            candidates: [{
              content: {
                parts: [{ text: "Invalid JSON" }]
              }
            }]
          });
        })
      );

      const result = await getMaximizerSuggestions('auth0-123', 40.7128, -74.0060);

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockOpportunities.slice(0, 3));
    });
  });

  describe('getMaximizerMatches (Logical)', () => {
    it('should find matches for a BAND user based on payout', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.venue.findMany).mockResolvedValue(mockOpportunities as any);

      const result = await getMaximizerMatches('auth0-123');

      expect(result).toHaveLength(3);
      expect(prisma.venue.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          minPayoutRequirement: { gte: 500 }
        })
      }));
    });

    it('should find matches for a VENUE user based on payout', async () => {
      const venueUser = {
        ...mockUser,
        role: 'VENUE',
        bandProfile: null,
        venueProfile: { name: 'The Blue Note', bio: 'Jazz club.', minPayoutRequirement: 500 }
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(venueUser as any);
      vi.mocked(prisma.band.findMany).mockResolvedValue(mockOpportunities as any);

      const result = await getMaximizerMatches('auth0-456');

      expect(result).toHaveLength(3);
      expect(prisma.band.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          minPayoutRequirement: { lte: 500 }
        })
      }));
    });
  });
});
