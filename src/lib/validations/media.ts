import { z } from 'zod';

export const MediaRegisterSchema = z.object({
  fileUrl: z.string().url(),
  fileType: z.enum(['audio', 'video', 'image']),
});
