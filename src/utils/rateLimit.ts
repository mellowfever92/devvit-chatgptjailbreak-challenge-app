import { RATE_LIMIT_SUBMISSIONS_PER_HOUR, GLOBAL_RATE_LIMIT_PER_HOUR } from '../config/constants.js';
import { rateLimitKey, globalRateLimitKey } from '../types/redis-keys.js';
import { redisClient } from './redis.js';

export async function checkRateLimit(challengeId: string, userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = rateLimitKey(challengeId, userId);
  const count = Number((await redisClient.get(key)) ?? 0);
  if (count >= RATE_LIMIT_SUBMISSIONS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: RATE_LIMIT_SUBMISSIONS_PER_HOUR - count };
}

export async function incrementRateLimit(challengeId: string, userId: string): Promise<void> {
  const key = rateLimitKey(challengeId, userId);
  const tx = redisClient.multi();
  tx.incr(key);
  tx.expire(key, 60 * 60);
  await tx.exec();
}

export async function checkGlobalRateLimit(userId: string): Promise<boolean> {
  const key = globalRateLimitKey(userId);
  const count = Number((await redisClient.get(key)) ?? 0);
  return count < GLOBAL_RATE_LIMIT_PER_HOUR;
}

export async function incrementGlobalRateLimit(userId: string): Promise<void> {
  const key = globalRateLimitKey(userId);
  const tx = redisClient.multi();
  tx.incr(key);
  tx.expire(key, 60 * 60);
  await tx.exec();
}
