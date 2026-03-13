/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transitionGigState, VALID_TRANSITIONS } from '../state-machine';
import { GigStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: vi.fn((cb) => cb({
      gig: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      offerHistory: {
        create: vi.fn(),
      },
    })),
  },
}));

describe('Negotiation State Machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow valid transitions', async () => {
    const gigId = 'gig_123';
    const actorId = 'user_123';
    const fromStatus = GigStatus.DRAFT;
    const toStatus = GigStatus.OFFER_SENT;

    // Mocking the transaction context
    const txMock = {
      gig: {
        findUnique: vi.fn().mockResolvedValue({ status: fromStatus }),
        update: vi.fn().mockResolvedValue({ id: gigId, status: toStatus }),
      },
      offerHistory: {
        create: vi.fn().mockResolvedValue({}),
      },
    };
    (prisma.$transaction as any).mockImplementation((cb: any) => cb(txMock));

    await transitionGigState(gigId, toStatus, actorId, 'Sending initial offer');

    expect(txMock.gig.findUnique).toHaveBeenCalledWith({
      where: { id: gigId },
      select: { status: true },
    });
    expect(txMock.gig.update).toHaveBeenCalledWith({
      where: { id: gigId },
      data: { status: toStatus },
    });
    expect(txMock.offerHistory.create).toHaveBeenCalledWith({
      data: {
        gigId,
        fromStatus,
        toStatus,
        changedById: actorId,
        changeReason: 'Sending initial offer',
      },
    });
  });

  it('should reject invalid transitions', async () => {
    const gigId = 'gig_123';
    const actorId = 'user_123';
    const fromStatus = GigStatus.BOOKED;
    const toStatus = GigStatus.DRAFT; // Invalid according to VALID_TRANSITIONS

    const txMock = {
      gig: {
        findUnique: vi.fn().mockResolvedValue({ status: fromStatus }),
      },
    };
    (prisma.$transaction as any).mockImplementation((cb: any) => cb(txMock));

    await expect(transitionGigState(gigId, toStatus, actorId)).rejects.toThrow(
      `Invalid transition from ${fromStatus} to ${toStatus}`
    );
  });

  it('should throw error if gig is not found', async () => {
    const gigId = 'non_existent';
    const txMock = {
      gig: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    (prisma.$transaction as any).mockImplementation((cb: any) => cb(txMock));

    await expect(transitionGigState(gigId, GigStatus.OFFER_SENT, 'user_123')).rejects.toThrow('Gig not found');
  });

  describe('VALID_TRANSITIONS coverage', () => {
    it('should have defined transitions for all statuses except COMPLETED (which is empty)', () => {
      Object.values(GigStatus).forEach((status) => {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
        if (status === GigStatus.COMPLETED) {
          expect(VALID_TRANSITIONS[status]).toHaveLength(0);
        }
      });
    });
  });
});
