export const SUBMISSIONS_PER_PAGE = 5;
export const RATE_LIMIT_SUBMISSIONS_PER_HOUR = 10;
export const GLOBAL_RATE_LIMIT_PER_HOUR = 50;
export const LEADERBOARD_LIMIT = 20;
export const MAX_PROMPT_LENGTH = 4000;
export const MIN_PROMPT_LENGTH = 10;
export const API_TIMEOUT_MS = 60000;

export const theme = {
  bg: {
    primary: '#0A0E27',
    secondary: '#141B3D',
    accent: '#1E2A5E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B8C5D6',
    tertiary: '#7A8BA0',
  },
  accent: {
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
} as const;

export const COST_ESTIMATES = {
  gpt4oPerSubmissionUsd: 0.0035,
  judgePerSubmissionUsd: 0.0025,
};
