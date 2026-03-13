import { z } from 'zod';

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  negotiationPrefs: z.object({
    minRate: z.number().min(0).optional(),
    openToNegotiate: z.boolean().optional()
  }).optional(),
  media: z.array(z.string().url()).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  agreementTemplate: z.string().max(10000).optional(),
});

export const AvailabilitySchema = z.object({
  date: z.string().datetime(),
  available: z.boolean(),
});

export const AvailabilityUpdateSchema = z.object({
  bookedDates: z.array(z.string().datetime()),
});

export const RatingSchema = z.object({
  stars: z.number().min(1).max(5),
});
