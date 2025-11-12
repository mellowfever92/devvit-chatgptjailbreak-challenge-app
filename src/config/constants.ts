export const PAGINATION = {
  submissionsPerPage: 5,
};

export const RATE_LIMIT = {
  submissionsPerHour: 10,
};

export const THEME = {
  bg: {
    primary: "#0A0E27",
    secondary: "#141B3D",
    accent: "#1E2A5E",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#B8C5D6",
    tertiary: "#7A8BA0",
  },
  accent: {
    primary: "#6366F1",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
} as const;

export const REDIS_KEYS = {
  submissions: (challengeId: string) => `challenge:${challengeId}:submissions`,
  submission: (challengeId: string, submissionId: string) =>
    `challenge:${challengeId}:submission:${submissionId}`,
  leaderboard: (challengeId: string) => `challenge:${challengeId}:leaderboard`,
  vote: (challengeId: string, userId: string) =>
    `challenge:${challengeId}:vote:${userId}`,
  rateLimit: (challengeId: string, userId: string) =>
    `challenge:${challengeId}:ratelimit:${userId}`,
  challenges: "challenges:definitions",
  stats: "platform:stats",
} as const;
