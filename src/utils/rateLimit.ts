import { Devvit } from "@devvit/public-api";
import { RATE_LIMIT } from "../config/constants.js";
import { getUserRateLimit, updateUserRateLimit } from "./redis.js";

export async function checkRateLimit(
  context: Devvit.Context,
  challengeId: string,
  userId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const timestamps = (await getUserRateLimit(context, challengeId, userId)).filter(
    (timestamp) => timestamp > oneHourAgo,
  );

  if (timestamps.length >= RATE_LIMIT.submissionsPerHour) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  timestamps.push(now);
  await updateUserRateLimit(context, challengeId, userId, timestamps);

  return {
    allowed: true,
    remaining: RATE_LIMIT.submissionsPerHour - timestamps.length,
  };
}
