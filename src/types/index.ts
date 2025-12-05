export type JudgeDecision = 'approved' | 'rejected';

export interface TokenUsage {
  input: number;
  output: number;
}

export interface Submission {
  id: string;
  userId: string;
  username: string;
  userPrompt: string;
  gpt4oResponse: string;
  gpt4oTokens: TokenUsage;
  judgeReasoning: string;
  judgeDecision: JudgeDecision;
  judgeTokens: TokenUsage;
  timestamp: number;
  challengeId: string;
  votes: number;
  voterIds: string[];
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  systemPrompt: string;
  model: 'gpt-4o-2024-08-06';
  intent: string;
  outputObjective: string;
  inputObjective: string;
  requiredComponents: string[];
  endDate: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  approvedSubmissions: number;
  totalVotes: number;
}

export interface ApiCostBreakdown {
  totalSubmissions: number;
  gpt4oTokens: TokenUsage;
  judgeTokens: TokenUsage;
  estimatedCostUsd: number;
}
