import { z } from 'zod';

export const AuthSyncSchema = z.object({
  auth0Id: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['BAND', 'VENUE']),
  name: z.string().max(100).optional().nullable(),
});
