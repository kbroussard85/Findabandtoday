import { z } from 'zod';

export const CheckoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
});
