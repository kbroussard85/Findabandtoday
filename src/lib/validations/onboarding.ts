import { z } from 'zod';

export const BandOnboardingSchema = z.object({
  name: z.string().min(2).max(100),
  searchRadius: z.number().min(5).max(500),
});

export const VenueOnboardingSchema = z.object({
  name: z.string().min(2).max(100),
  capacity: z.number().min(1).max(1000000).optional(),
});
