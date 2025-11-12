import { Devvit } from "@devvit/public-api";
import { CostStats } from "../types/index.js";

export interface OpenAIUsage {
  input: number;
  output: number;
}

export interface OpenAIResult {
  text: string;
  usage: OpenAIUsage;
}

const GPT4O_MODEL = "gpt-4o-2024-08-06";
const O4_MINI_MODEL = "o4-mini";

const PRICING = {
  [GPT4O_MODEL]: {
    input: 2.5 / 1_000_000,
    output: 10 / 1_000_000,
  },
  [O4_MINI_MODEL]: {
    input: 1.1 / 1_000_000,
    output: 4.4 / 1_000_000,
  },
} as const;

export const models = {
  gpt4o: GPT4O_MODEL,
  o4mini: O4_MINI_MODEL,
} as const;

async function callOpenAI(
  context: Devvit.Context,
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
): Promise<OpenAIResult> {
  // Try to get API key from Devvit settings first (production)
  let apiKey = await context.settings.get("openaiApiKey");
  
  // Fall back to environment variable for local development
  if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY;
  }
  
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. " +
      "Set OPENAI_API_KEY in .env for development, or configure in app settings for production."
    );
  }

  const response = await context.fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error("OpenAI API returned no content.");
  }

  const usage: OpenAIUsage = {
    input: data.usage?.prompt_tokens ?? 0,
    output: data.usage?.completion_tokens ?? 0,
  };

  return { text: message, usage };
}

export async function runGpt4oTest(
  context: Devvit.Context,
  systemPrompt: string,
  userPrompt: string,
): Promise<OpenAIResult> {
  return callOpenAI(context, GPT4O_MODEL, [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
}

export async function judgeWithO4Mini(
  context: Devvit.Context,
  prompt: string,
): Promise<OpenAIResult> {
  return callOpenAI(context, O4_MINI_MODEL, [
    { role: "user", content: prompt },
  ]);
}

export function accumulateCosts(stats: CostStats, model: string, usage: OpenAIUsage) {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) {
    return;
  }

  const cost =
    (usage.input * pricing.input + usage.output * pricing.output) || 0;

  if (model === GPT4O_MODEL) {
    stats.gpt4o.submissions += 1;
    stats.gpt4o.tokens.input += usage.input;
    stats.gpt4o.tokens.output += usage.output;
    stats.gpt4o.costUsd += cost;
  } else if (model === O4_MINI_MODEL) {
    stats.o4mini.submissions += 1;
    stats.o4mini.tokens.input += usage.input;
    stats.o4mini.tokens.output += usage.output;
    stats.o4mini.costUsd += cost;
  }
}

export function createEmptyCostStats(): CostStats {
  return {
    gpt4o: {
      submissions: 0,
      tokens: { input: 0, output: 0 },
      costUsd: 0,
    },
    o4mini: {
      submissions: 0,
      tokens: { input: 0, output: 0 },
      costUsd: 0,
    },
  };
}
