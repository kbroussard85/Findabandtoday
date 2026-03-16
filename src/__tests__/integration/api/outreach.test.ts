/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ai/outreach/route';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { draftLiaisonOffer } from '@/lib/ai/agents/liaison';

vi.mock('@auth0/nextjs-auth0', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    venue: {
      findUnique: vi.fn(),
    },
    band: {
      findUnique: vi.fn(),
    },
    venueAgreement: {
      findFirst: vi.fn(),
    },
    gig: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai/agents/liaison', () => ({
  draftLiaisonOffer: vi.fn(),
}));

function createRequest(body: any) {
  return new Request('http://localhost:3000/api/ai/outreach', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('AI Outreach API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    (getSession as any).mockResolvedValue(null);
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should successfully create a draft gig when band contacts venue', async () => {
    const mockUser = { id: 'user-1', auth0Id: 'auth0-1', role: 'BAND', bandProfile: { id: 'band-1', name: 'The Rockers' } };
    const mockVenue = { id: 'venue-1', name: 'The Blue Note' };
    const mockAiMessage = 'Hello Venue, please book us.';

    (getSession as any).mockResolvedValue({ user: { sub: 'auth0-1' } });
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (prisma.venue.findUnique as any).mockResolvedValue(mockVenue);
    (draftLiaisonOffer as any).mockResolvedValue(mockAiMessage);
    (prisma.gig.create as any).mockResolvedValue({ id: 'gig-1' });

    const req = createRequest({
      recipientId: 'venue-1',
      suggestedAmount: 500,
      date: '2026-06-20'
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.gig.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        bandId: 'band-1',
        venueId: 'venue-1',
        status: 'DRAFT',
        totalAmount: 500
      })
    }));
  });
});
