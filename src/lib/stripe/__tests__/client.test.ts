import { describe, it, expect } from 'vitest';
import { stripe as stripe1 } from '../client';

describe('Stripe Singleton', () => {
  it('should return the same instance across multiple imports', async () => {
    // Import again dynamically to test singleton behavior
    const { stripe: stripe2 } = await import('../client');
    
    // Both should be the same object reference (or both null if not configured)
    expect(stripe1 === stripe2).toBe(true);
  });
});
