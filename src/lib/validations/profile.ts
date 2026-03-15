import { z } from 'zod';

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).nullable().optional(),
  negotiationPrefs: z.object({
    minRate: z.number().min(0).optional(),
    openToNegotiate: z.boolean().optional()
  }).optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string().optional()
  })).optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  logoUrl: z.string().url().or(z.literal('')).nullable().optional(),
  agreementTemplate: z.string().max(10000).optional(),
  socialLinks: z.object({
    spotify: z.string().url().or(z.literal('')).nullable().optional(),
    youtube: z.string().url().or(z.literal('')).nullable().optional(),
    tiktok: z.string().url().or(z.literal('')).nullable().optional(),
    instagram: z.string().url().or(z.literal('')).nullable().optional(),
    website: z.string().url().or(z.literal('')).nullable().optional(),
    hoursOfOperation: z.string().nullable().optional(),
  }).optional(),
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
