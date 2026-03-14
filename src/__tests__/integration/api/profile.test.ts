/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/profile/route';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';

vi.mock('@auth0/nextjs-auth0', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    venue: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    venueMember: {
      upsert: vi.fn(),
    },
    venueAgreement: {
      upsert: vi.fn(),
    },
    $executeRawUnsafe: vi.fn(),
  },
}));

// Helper to create a NextRequest-like object
function createRequest(body?: any) {
  return new Request('http://localhost:3000/api/profile', {
    method: body ? 'POST' : 'GET',
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Profile API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as any).mockResolvedValue(null);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('should return 404 if user not found in DB', async () => {
      (getSession as any).mockResolvedValue({ user: { sub: 'auth0_123' } });
      (prisma.user.findUnique as any).mockResolvedValue(null);
      const response = await GET();
      expect(response.status).toBe(404);
    });

    it('should return user data if found', async () => {
      const mockUser = { id: 'user_1', auth0Id: 'auth0_123', name: 'Test User' };
      (getSession as any).mockResolvedValue({ user: { sub: 'auth0_123' } });
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockUser);
    });
  });

  describe('POST', () => {
    it('should return 400 for invalid input', async () => {
      (getSession as any).mockResolvedValue({ user: { sub: 'auth0_123' } });
      const req = createRequest({ name: '' }); // Invalid according to schema (min 1)
      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it('should update profile and return success for VENUE role', async () => {
      (getSession as any).mockResolvedValue({ user: { sub: 'auth0_123' } });
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user_1', role: 'VENUE' });
      (prisma.venue.findUnique as any).mockResolvedValue({ id: 'venue_1' });
      (prisma.venue.update as any).mockResolvedValue({ id: 'venue_1' });

      const req = createRequest({ 
        name: 'New Venue Name', 
        bio: 'New Bio',
        lat: 34.05,
        lng: -118.24,
        agreementTemplate: 'Template text'
      });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.venue.update).toHaveBeenCalled();
      expect(prisma.venueAgreement.upsert).toHaveBeenCalled();
      expect(prisma.$executeRawUnsafe).toHaveBeenCalled();
    });

    it('should create venue if it does not exist', async () => {
      (getSession as any).mockResolvedValue({ user: { sub: 'auth0_123', name: 'Auth0 Name' } });
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'user_1', role: 'VENUE' });
      (prisma.venue.findUnique as any).mockResolvedValue(null);
      (prisma.venue.create as any).mockResolvedValue({ id: 'new_venue_1' });
      (prisma.venue.update as any).mockResolvedValue({ id: 'new_venue_1' });

      const req = createRequest({ name: 'New Venue' });
      const response = await POST(req);
      
      expect(response.status).toBe(200);
      expect(prisma.venue.create).toHaveBeenCalled();
    });

    it('should handle internal server error', async () => {
      (getSession as any).mockRejectedValue(new Error('Auth0 Error'));
      const req = createRequest({ name: 'New Venue' });
      const response = await POST(req);
      expect(response.status).toBe(500);
    });
  });
});
