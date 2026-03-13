/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeBookingHold, captureBookingFee, releaseBookingHold } from '../escrow';
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
    it('should initialize a hold with 5% fee for amounts >= 1000', async () => {
      const gigId = 'gig_123';
      const amount = 2000;
      const stripeCustomerId = 'cus_123';
      const paymentIntentId = 'pi_123';

      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        venue: {
          user: {
            stripeCustomerId,
          },
        },
      });

      (stripe!.paymentIntents.create as any).mockResolvedValue({
        id: paymentIntentId,
        client_secret: 'secret_123',
      });

      const clientSecret = await initializeBookingHold(gigId, amount);

      expect(stripe!.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100 * 100, // 5% of 2000 is 100, in cents is 10000
          customer: stripeCustomerId,
          capture_method: 'manual',
        }),
        expect.any(Object)
      );
      expect(prisma.gig.update).toHaveBeenCalledWith({
        where: { id: gigId },
        data: {
          stripePaymentIntentId: paymentIntentId,
          status: 'ESCROW_HOLD',
        },
      });
      expect(clientSecret).toBe('secret_123');
    });

    it('should initialize a hold with $50 flat fee for amounts < 1000', async () => {
      const gigId = 'gig_123';
      const amount = 500;
      const stripeCustomerId = 'cus_123';

      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        venue: {
          user: {
            stripeCustomerId,
          },
        },
      });

      (stripe!.paymentIntents.create as any).mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
      });

      await initializeBookingHold(gigId, amount);

      expect(stripe!.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50 * 100, // $50 flat fee
        }),
        expect.any(Object)
      );
    });

    it('should throw error if gig or stripeCustomerId is missing', async () => {
      (prisma.gig.findUnique as any).mockResolvedValue(null);
      await expect(initializeBookingHold('invalid', 100)).rejects.toThrow('Venue or stripe customer ID not found.');
    });
  });

  describe('captureBookingFee', () => {
    it('should capture a payment intent', async () => {
      const gigId = 'gig_123';
      const paymentIntentId = 'pi_123';

      (prisma.gig.findUnique as any).mockResolvedValue({
        id: gigId,
        stripePaymentIntentId: paymentIntentId,
      });

      (stripe!.paymentIntents.capture as any).mockResolvedValue({ id: paymentIntentId });

      await captureBookingFee(gigId);

      expect(stripe!.paymentIntents.capture).toHaveBeenCalledWith(paymentIntentId, {}, expect.any(Object));
      expect(prisma.gig.update).toHaveBeenCalledWith({
        where: { id: gigId },
        data: {
          status: 'CONFIRMED',
          depositPaid: true,
        },
      });
    });

    it('should throw error if payment intent ID is missing', async () => {
      (prisma.gig.findUnique as any).mockResolvedValue({ id: 'gig_123' });
      await expect(captureBookingFee('gig_123')).rejects.toThrow('No payment intent found.');
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
      expect(prisma.gig.update).toHaveBeenCalledWith({
        where: { id: gigId },
        data: { status: 'CANCELLED' },
      });
    });
  });
});
