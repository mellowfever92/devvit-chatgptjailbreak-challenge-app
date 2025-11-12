import { Devvit, useState } from "@devvit/public-api";
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

export const SubmissionForm = ({ onSubmit, isRateLimited, remainingSubmissions }: SubmissionFormProps): JSX.Element => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");  // Store as JSON string instead
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (loading || !prompt.trim() || isRateLimited) return;
    setLoading(true);
    setError("");
    try {
      const result = await onSubmit(prompt.trim());
      if (!result.success) {
        setError(result.error ?? "Submission failed.");
        setFeedback("");
      } else {
        setFeedback(JSON.stringify(result));
      }
    } catch (err) {
      setError((err as Error).message);
      setFeedback("");
    } finally {
      setLoading(false);
    }
  };

  const parsedFeedback = feedback ? JSON.parse(feedback) as SubmissionFormResult : null;

  return (
    <vstack gap="medium">
      <vstack
        padding="medium"
        gap="small"
      >
        <text color={THEME.text.primary} weight="bold">Enter your jailbreak prompt</text>
        <text size="small" color={THEME.text.secondary}>
          Craft your persona, technique, or exploit here...
        </text>
        <text size="small" color={THEME.text.primary}>
          {prompt || "(Empty)"}
        </text>
        <button
          appearance="secondary"
          onPress={() => {
            // Note: textarea is not available in Devvit Blocks, this is a placeholder
            // In a real app, you'd use a form or other input mechanism
            setPrompt("Enter your prompt here");
          }}
        >
          Edit Prompt
        </button>
      </vstack>
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
        disabled={loading || isRateLimited || !prompt.trim()}
        onPress={handleSubmit}
      >
        {loading ? "Submitting..." : "Submit for verification"}
      </button>
      {error && (
        <text color={THEME.accent.error} size="small">
          {error}
        </text>
      )}
      {parsedFeedback && parsedFeedback.success && (
        <vstack gap="medium">
          {parsedFeedback.gpt4oResponse && (
            <vstack gap="small">
              <text color={THEME.text.secondary}>GPT-4o Output</text>
              <text size="small" color={THEME.text.primary}>
                {parsedFeedback.gpt4oResponse}
              </text>
              {parsedFeedback.gpt4oTokens && (
                <text size="xsmall" color={THEME.text.secondary}>
                  Tokens — Input: {parsedFeedback.gpt4oTokens.input} • Output: {parsedFeedback.gpt4oTokens.output}
                </text>
              )}
            </vstack>
          )}
          {parsedFeedback.judgeReasoning && parsedFeedback.judgeDecision && (
            <JudgeFeedback
              reasoning={parsedFeedback.judgeReasoning}
              decision={parsedFeedback.judgeDecision}
            />
          )}
          {parsedFeedback.judgeTokens && (
            <text size="xsmall" color={THEME.text.secondary}>
              Judge Tokens — Input: {parsedFeedback.judgeTokens.input} • Output: {parsedFeedback.judgeTokens.output}
            </text>
          )}
        </vstack>
      )}
    </vstack>
  );
};
