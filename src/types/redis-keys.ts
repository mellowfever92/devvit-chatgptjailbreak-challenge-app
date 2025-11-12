export const redisKeys = {
  submissions: (challengeId: string) => `challenge:${challengeId}:submissions`,
  submission: (challengeId: string, submissionId: string) =>
    `challenge:${challengeId}:submission:${submissionId}`,
  leaderboard: (challengeId: string) => `challenge:${challengeId}:leaderboard`,
  vote: (challengeId: string, userId: string) => `challenge:${challengeId}:vote:${userId}`,
  rateLimit: (challengeId: string, userId: string) =>
    `challenge:${challengeId}:ratelimit:${userId}`,
  challenges: "challenges:definitions",
  stats: "platform:stats",
} as const;
