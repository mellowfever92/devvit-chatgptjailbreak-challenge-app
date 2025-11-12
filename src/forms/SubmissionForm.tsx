import { Devvit, useState } from '@devvit/public-api';
import type { Challenge, Submission } from '../types/index.js';
import { checkRateLimit, incrementRateLimit } from '../utils/rateLimit.js';
import { runTestPrompt } from '../utils/testPrompt.js';
import { judgeSubmission as runJudge } from '../utils/judgeSubmission.js';
import { saveSubmission, recordApiUsage, updateLeaderboard } from '../utils/redis.js';
import { theme } from '../config/constants.js';

export interface SubmissionFormProps {
  challenge: Challenge;
  onSubmissionComplete?: (submission: Submission) => void;
}

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string }
  | { status: 'result'; submission: Submission };

type SubmissionFormContextProps = SubmissionFormProps & {
  metadata?: {
    userId?: string;
    username?: string;
  };
};

export const SubmissionForm: Devvit.BlockComponent<SubmissionFormProps> = (props: SubmissionFormContextProps) => {
  const { challenge, onSubmissionComplete, metadata } = props;
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<FormState>({ status: 'idle' });

  const handleSubmit = async () => {
    if (!metadata?.userId || !metadata?.username) {
      setState({ status: 'error', message: 'You must be logged in to submit.' });
      return;
    }

    setState({ status: 'submitting' });

    try {
      const { allowed } = await checkRateLimit(challenge.id, metadata.userId);
      if (!allowed) {
        setState({ status: 'error', message: 'Rate limit exceeded. Try again in an hour.' });
        return;
      }

      const testResult = await runTestPrompt(challenge, prompt);
      const judgeResult = await runJudge(challenge, prompt, testResult.response);

      const submission: Submission = {
        id: Devvit.randomUuid(),
        userId: metadata.userId,
        username: metadata.username ?? metadata.userId,
        userPrompt: prompt,
        gpt4oResponse: testResult.response,
        gpt4oTokens: testResult.tokens,
        judgeReasoning: judgeResult.reasoning,
        judgeDecision: judgeResult.decision,
        judgeTokens: judgeResult.tokens,
        timestamp: Date.now(),
        challengeId: challenge.id,
        votes: 0,
        voterIds: [],
      };

      await incrementRateLimit(challenge.id, metadata.userId);
      await saveSubmission(submission);
      await recordApiUsage(submission);
      await updateLeaderboard(submission);

      setState({ status: 'result', submission });
      setPrompt('');
      onSubmissionComplete?.(submission);
    } catch (error) {
      console.error(error);
      setState({ status: 'error', message: (error as Error).message });
    }
  };

  return (
    <vstack gap="medium" padding="medium" backgroundColor={theme.bg.secondary} cornerRadius="medium">
      <text size="large" color={theme.text.primary} weight="bold">
        Submit your jailbreak attempt
      </text>
      <textbox
        label="Your prompt"
        placeholder="Share your jailbreak prompt here"
        value={prompt}
        onChange={(value) => setPrompt(value)}
        rows={8}
      />
      <button
        appearance="primary"
        text="Run verification"
        onPress={handleSubmit}
        disabled={prompt.trim().length === 0 || state.status === 'submitting'}
      />
      {state.status === 'submitting' && (
        <text color={theme.accent.warning}>Testing and judging your prompt...</text>
      )}
      {state.status === 'error' && (
        <text color={theme.accent.error}>{state.message}</text>
      )}
      {state.status === 'result' && (
        <vstack gap="small" backgroundColor={theme.bg.accent} padding="medium" cornerRadius="medium">
          <text color={theme.text.primary} weight="bold">
            Submission {state.submission.judgeDecision === 'approved' ? 'approved!' : 'rejected'}
          </text>
          <text color={theme.text.secondary}>Judge reasoning:</text>
          <text color={theme.text.primary}>{state.submission.judgeReasoning}</text>
        </vstack>
      )}
    </vstack>
  );
};
