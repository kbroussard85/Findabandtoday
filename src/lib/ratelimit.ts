// src/lib/ratelimit.ts
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken 
  ? new Redis({ url: redisUrl, token: redisToken }) 
  : null;

/**
 * Helper to create a ratelimiter or return null if credentials are missing
 */
function createLimiter(requests: number, window: Duration, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `@upstash/ratelimit/${prefix}`,
  });
}

// Create ratelimiters
export const syncRateLimit = createLimiter(10, "1 m", "sync");
export const discoveryRateLimit = createLimiter(60, "1 m", "discovery");
export const checkoutRateLimit = createLimiter(5, "1 m", "checkout");
export const escrowRateLimit = createLimiter(10, "1 m", "escrow");
