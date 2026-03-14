/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeBookingHold, captureBookingEscrow, releaseBookingHold } from '../escrow';
import { stripe } from '../client';
import prisma from '../../prisma';

vi.mock('../client', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      capture: vi.fn(),
      cancel: vi.fn(),
    },
  },
}));

vi.mock('../../prisma', () => ({
  default: {
    gig: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Escrow Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeBookingHold', () => {
    it('should initialize a hold for PLATFORM method', async () => {
      const gigId = 'gig_123';
      const amount = 2000;
      const stripeCustomerId = 'cus_123';
      const paymentIntentId = 'pi_123';

      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        venue: { user: { stripeCustomerId } },
        band: { user: { stripeAccountId: 'acct_123' } }
      });

      (stripe!.paymentIntents.create as any).mockResolvedValue({
        id: paymentIntentId,
        client_secret: 'secret_123',
      });

      const result = await initializeBookingHold(gigId, amount, 'PLATFORM');

      expect(stripe!.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2000 * 100,
          customer: stripeCustomerId,
          capture_method: 'manual',
        }),
        expect.objectContaining({ idempotencyKey: `escrow-${gigId}` })
      );
      expect(result).toEqual({ clientSecret: 'secret_123', method: 'PLATFORM' });
    });

    it('should update gig for IN_PERSON method without creating payment intent', async () => {
      const gigId = 'gig_123';
      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        venue: { user: { stripeCustomerId: 'cus_v' } },
        band: { user: { stripeCustomerId: 'cus_b' } }
      });

      const result = await initializeBookingHold(gigId, 500, 'IN_PERSON');

      expect(stripe!.paymentIntents.create).not.toHaveBeenCalled();
      expect(prisma.gig.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ paymentMethod: 'IN_PERSON' })
      }));
      expect(result).toEqual({ success: true, method: 'IN_PERSON' });
    });
  });

  describe('captureBookingEscrow', () => {
    it('should capture a payment intent', async () => {
      const gigId = 'gig_123';
      const paymentIntentId = 'pi_123';

      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        stripePaymentIntentId: paymentIntentId,
      });

      (stripe!.paymentIntents.capture as any).mockResolvedValue({ id: paymentIntentId });

      await captureBookingEscrow(gigId);

      expect(stripe!.paymentIntents.capture).toHaveBeenCalledWith(
        paymentIntentId,
        {},
        expect.objectContaining({ idempotencyKey: `capture-${gigId}` })
      );
    });
  });

  describe('releaseBookingHold', () => {
    it('should cancel a payment intent', async () => {
      const gigId = 'gig_123';
      const paymentIntentId = 'pi_123';

      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        stripePaymentIntentId: paymentIntentId,
      });

      await releaseBookingHold(gigId);

      expect(stripe!.paymentIntents.cancel).toHaveBeenCalledWith(paymentIntentId);
    });
  });
});
