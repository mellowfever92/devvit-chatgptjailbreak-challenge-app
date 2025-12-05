import { Devvit } from '@devvit/public-api';
import { GPT4O_MODEL, OpenAiClient } from '../config/openai.js';
import type { Challenge, TokenUsage } from '../types/index.js';

export interface TestPromptResult {
  response: string;
  tokens: TokenUsage;
}

export async function runTestPrompt(challenge: Challenge, userPrompt: string): Promise<TestPromptResult> {
  const apiKey = await Devvit.settings.get('openaiApiKey');
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }
  const client = new OpenAiClient({ apiKey });
  const completion = await client.chatCompletion(GPT4O_MODEL, [
    { role: 'system', content: challenge.systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  return {
    response: completion.content,
    tokens: {
      input: completion.usage.prompt_tokens,
      output: completion.usage.completion_tokens,
    },
  };
}
