import { z } from 'zod';

export const GigCreateSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(3000).optional(),
  date: z.string().datetime(),
  venueId: z.string().min(1), // cuid or uuid
  bandId: z.string().min(1).optional(),
  totalAmount: z.number().min(0),
  guarantee: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
});

export const GigUpdateSchema = GigCreateSchema.partial();
