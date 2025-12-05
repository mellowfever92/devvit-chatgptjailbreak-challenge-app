import { RATE_LIMIT_SUBMISSIONS_PER_HOUR } from '../config/constants.js';
import { rateLimitKey } from '../types/redis-keys.js';
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
