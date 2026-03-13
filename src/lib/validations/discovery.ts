import { z } from 'zod';

export const DiscoveryQuerySchema = z.object({
  lat: z.string().optional().default('0').transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= -90 && val <= 90),
  lng: z.string().optional().default('0').transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= -180 && val <= 180),
  radius: z.string().optional().default('50').transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0),
  role: z.enum(['BAND', 'VENUE']).optional().default('BAND'),
  q: z.string().max(100).optional(),
  genre: z.string().max(50).optional(),
  limit: z.string().optional().default('20').transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0 && val <= 100),
  offset: z.string().optional().default('0').transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val >= 0),
});
