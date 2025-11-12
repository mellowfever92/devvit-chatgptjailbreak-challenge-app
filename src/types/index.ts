export interface Submission {
  id: string;
  userId: string;
  username: string;
  userPrompt: string;
  gpt4oResponse: string;
  gpt4oTokens: {
    input: number;
    output: number;
  };
  judgeReasoning: string;
  judgeDecision: "approved" | "rejected" | "pending";
  judgeTokens: {
    input: number;
    output: number;
  };
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
  model: "gpt-4o-2024-08-06";
  intent: string;
  outputObjective: string;
  inputObjective: string;
  requiredComponents: string[];
  endDate: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  submissions: number;
}

export interface RateLimitRecord {
  timestamps: number[];
}

export interface CostStats {
  gpt4o: {
    submissions: number;
    tokens: {
      input: number;
      output: number;
    };
    costUsd: number;
  };
  o4mini: {
    submissions: number;
    tokens: {
      input: number;
      output: number;
    };
    costUsd: number;
  };
}
