/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/gigs/[id]/escrow/route';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import * as escrowUtils from '@/lib/stripe/escrow';

vi.mock('@auth0/nextjs-auth0', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    gig: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/stripe/escrow', () => ({
  initializeBookingHold: vi.fn(),
  captureBookingEscrow: vi.fn(),
  releaseBookingHold: vi.fn(),
}));

function createRequest(body: any) {
  return new Request('http://localhost:3000/api/gigs/gig_123/escrow', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const mockParams = Promise.resolve({ id: 'gig_123' });

describe('Escrow API Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getSession as any).mockResolvedValue(null);
    const req = createRequest({ action: 'RELEASE' });
    const response = await POST(req, { params: mockParams });
    expect(response.status).toBe(401);
  });

  it('should return 404 if gig not found', async () => {
    (getSession as any).mockResolvedValue({ user: { sub: 'auth0_123' } });
    (prisma.gig.findUnique as any).mockResolvedValue(null);
    
    const req = createRequest({ action: 'RELEASE' });
    const response = await POST(req, { params: mockParams });
    expect(response.status).toBe(404);
  });

  it('should return 403 if user is neither band nor venue owner', async () => {
    (getSession as any).mockResolvedValue({ user: { sub: 'unauthorized_user' } });
    (prisma.gig.findUnique as any).mockResolvedValue({
      id: 'gig_123',
      band: { user: { auth0Id: 'band_owner' } },
      venue: { user: { auth0Id: 'venue_owner' } },
    });

    const req = createRequest({ action: 'RELEASE' });
    const response = await POST(req, { params: mockParams });
    expect(response.status).toBe(403);
  });

  it('should return 200 if user is band owner', async () => {
    (getSession as any).mockResolvedValue({ user: { sub: 'band_owner' } });
    (prisma.gig.findUnique as any).mockResolvedValue({
      id: 'gig_123',
      band: { user: { auth0Id: 'band_owner' } },
      venue: { user: { auth0Id: 'venue_owner' } },
    });
    (escrowUtils.releaseBookingHold as any).mockResolvedValue({ success: true });

    const req = createRequest({ action: 'RELEASE' });
    const response = await POST(req, { params: mockParams });
    
    expect(response.status).toBe(200);
    expect(escrowUtils.releaseBookingHold).toHaveBeenCalledWith('gig_123');
  });

  it('should return 200 if user is venue owner', async () => {
    (getSession as any).mockResolvedValue({ user: { sub: 'venue_owner' } });
    (prisma.gig.findUnique as any).mockResolvedValue({
      id: 'gig_123',
      band: { user: { auth0Id: 'band_owner' } },
      venue: { user: { auth0Id: 'venue_owner' } },
    });
    (escrowUtils.releaseBookingHold as any).mockResolvedValue({ success: true });

    const req = createRequest({ action: 'RELEASE' });
    const response = await POST(req, { params: mockParams });
    
    expect(response.status).toBe(200);
    expect(escrowUtils.releaseBookingHold).toHaveBeenCalledWith('gig_123');
  });
});
