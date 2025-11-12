import { Devvit } from "@devvit/public-api";
import { useState } from "@devvit/public-api/block-components";
import { THEME } from "../config/constants.js";
import { JudgeFeedback } from "../components/ui/JudgeFeedback.js";

export interface SubmissionFormResult {
  success: boolean;
  error?: string;
  gpt4oResponse?: string;
  judgeReasoning?: string;
  judgeDecision?: "approved" | "rejected" | "pending";
  gpt4oTokens?: {
    input: number;
    output: number;
  };
  judgeTokens?: {
    input: number;
    output: number;
  };
}

export interface SubmissionFormProps {
  onSubmit: (prompt: string) => Promise<SubmissionFormResult>;
  isRateLimited: boolean;
  remainingSubmissions: number;
}

export const SubmissionForm = Devvit.Blocks.Component<SubmissionFormProps>(
  ({ onSubmit, isRateLimited, remainingSubmissions }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<SubmissionFormResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
      if (loading || !prompt.trim() || isRateLimited) return;
      setLoading(true);
      setError(null);
      try {
        const result = await onSubmit(prompt.trim());
        if (!result.success) {
          setError(result.error ?? "Submission failed.");
          setFeedback(null);
        } else {
          setFeedback(result);
        }
      } catch (err) {
        setError((err as Error).message);
        setFeedback(null);
      } finally {
        setLoading(false);
      }
    };

    return (
      <vstack gap="medium">
        <textarea
          label="Enter your jailbreak prompt"
          value={prompt}
          placeholder="Craft your persona, technique, or exploit here..."
          disabled={loading || isRateLimited}
          onChange={setPrompt}
        />
        <text size="small" color={THEME.text.secondary}>
          Remaining submissions this hour: {remainingSubmissions}
        </text>
        {isRateLimited && (
          <text color={THEME.accent.error} size="small">
            Rate limit reached. Try again in a bit.
          </text>
        )}
        <button
          appearance="primary"
          label={loading ? "Submitting..." : "Submit for verification"}
          disabled={loading || isRateLimited || !prompt.trim()}
          onPress={handleSubmit}
        />
        {error && (
          <text color={THEME.accent.error} size="small">
            {error}
          </text>
        )}
        {feedback && feedback.success && (
          <vstack gap="medium">
            {feedback.gpt4oResponse && (
              <vstack gap="small">
                <text color={THEME.text.secondary}>GPT-4o Output</text>
                <text size="small" color={THEME.text.primary}>
                  {feedback.gpt4oResponse}
                </text>
                {feedback.gpt4oTokens && (
                  <text size="xsmall" color={THEME.text.secondary}>
                    Tokens — Input: {feedback.gpt4oTokens.input} • Output: {feedback.gpt4oTokens.output}
                  </text>
                )}
              </vstack>
            )}
            {feedback.judgeReasoning && feedback.judgeDecision && (
              <JudgeFeedback
                reasoning={feedback.judgeReasoning}
                decision={feedback.judgeDecision}
              />
            )}
            {feedback.judgeTokens && (
              <text size="xsmall" color={THEME.text.secondary}>
                Judge Tokens — Input: {feedback.judgeTokens.input} • Output: {feedback.judgeTokens.output}
              </text>
            )}
          </vstack>
        )}
      </vstack>
    );
  },
);
