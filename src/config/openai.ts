import { API_TIMEOUT_MS } from './constants.js';

export const GPT4O_MODEL = 'gpt-4o-2024-08-06';
export const JUDGE_MODEL = 'o4-mini';

export interface OpenAiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAiChatResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface OpenAiClientOptions {
  apiKey: string;
}

export class OpenAiClient {
  private readonly apiKey: string;

  constructor(options: OpenAiClientOptions) {
    this.apiKey = options.apiKey;
  }

  async chatCompletion(model: string, messages: OpenAiChatMessage[]): Promise<OpenAiChatResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI request failed (${response.status}): ${body}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content ?? '';
      const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

      return {
        content: message,
        usage,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('API request timed out. Please try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
