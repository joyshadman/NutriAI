import { Redis } from '@upstash/redis';
import { numberEnv } from '@/lib/env';

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix timestamp in milliseconds when the current window resets. */
  reset: number;
  /** False when Upstash is not configured; the request was allowed through. */
  configured: boolean;
};

let client: Redis | null = null;

function getClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  client ??= new Redis({ url, token });
  return client;
}

/**
 * Best effort client identity. Signed in users are limited by user id, guests
 * by the address the proxy reports.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Fixed window counter in Redis. Not atomic (incr then expire on the first
 * hit), which is fine for spend guardrails; the window is short.
 */
export async function rateLimit(
  identifier: string,
  options: { limit?: number; windowSeconds?: number } = {},
): Promise<RateLimitResult> {
  const limit = options.limit ?? numberEnv('AI_RATE_LIMIT', 20);
  const windowSeconds =
    options.windowSeconds ?? numberEnv('AI_RATE_WINDOW_SECONDS', 60);
  const redis = getClient();

  if (!redis) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowSeconds * 1000,
      configured: false,
    };
  }

  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  const ttl = await redis.ttl(key);
  const reset = Date.now() + Math.max(ttl, 0) * 1000;

  return {
    success: count <= limit,
    limit,
    remaining: Math.max(limit - count, 0),
    reset,
    configured: true,
  };
}

export function rateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
  };
}
