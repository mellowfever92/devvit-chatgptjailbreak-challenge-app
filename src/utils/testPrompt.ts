import { Devvit } from "@devvit/public-api";
import { runGpt4oTest } from "../config/openai.js";

export async function testPrompt(
  context: Devvit.Context,
  systemPrompt: string,
  userPrompt: string,
) {
  return runGpt4oTest(context, systemPrompt, userPrompt);
}
