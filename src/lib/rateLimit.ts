/**
 * Rate Limiting Utility using Upstash Redis
 * Protects API routes from abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (uses environment variables)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create rate limiters for different use cases
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
  prefix: '@upstash/ratelimit/api',
});

export const authRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute for auth
  analytics: true,
  prefix: '@upstash/ratelimit/auth',
});

export const uploadRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 uploads per minute
  analytics: true,
  prefix: '@upstash/ratelimit/upload',
});

export const paymentRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 payment requests per minute
  analytics: true,
  prefix: '@upstash/ratelimit/payment',
});

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from auth header if available
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // In a real app, decode the token to get user ID
    // For now, we'll use IP as fallback
  }

  // Get IP address from headers (works with Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

  return ip;
}

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If Redis is unavailable, allow the request (fail open)
    // In production, you might want to fail closed
    console.error('Rate limit check failed:', error);
    return {
      success: true, // Fail open
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Middleware helper for Next.js API routes
 */
export async function withRateLimit(
  request: Request,
  limiter: Ratelimit = apiRateLimit
): Promise<{ success: true } | { success: false; error: string; reset: number }> {
  const identifier = getRateLimitIdentifier(request);
  const result = await checkRateLimit(limiter, identifier);

  if (!result.success) {
    return {
      success: false,
      error: `Rate limit exceeded. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
      reset: result.reset,
    };
  }

  return { success: true };
}

