import { Devvit, useState } from '@devvit/public-api';
import type { Submission } from '../../types/index.js';
import { theme } from '../../config/constants.js';

export interface SubmissionCardProps {
  submission: Submission;
  onVote?: (submission: Submission) => void;
  canVote: boolean;
}

export const SubmissionCard: Devvit.BlockComponent<SubmissionCardProps> = ({ submission, onVote, canVote }) => {
  const [expanded, setExpanded] = useState(false);

  const borderColor =
    submission.judgeDecision === 'approved'
      ? theme.accent.success
      : submission.judgeDecision === 'rejected'
      ? theme.accent.error
      : theme.accent.warning;

  return (
    <vstack
      gap="small"
      padding="medium"
      cornerRadius="medium"
      borderWidth="medium"
      borderColor={borderColor}
      backgroundColor={theme.bg.secondary}
    >
      <hstack justifyContent="space-between" alignItems="center">
        <text color={theme.text.primary} weight="bold">
          {submission.username}
        </text>
        {submission.judgeDecision === 'approved' && (
          <hstack gap="small" alignItems="center">
            <icon name="upvote-filled" color={theme.accent.success} />
            <text color={theme.text.primary}>{submission.votes}</text>
            <button
              text="Vote"
              appearance="primary"
              disabled={!canVote}
              onPress={() => canVote && onVote?.(submission)}
            />
          </hstack>
        )}
      </hstack>
      <text color={theme.text.secondary}>
        {submission.userPrompt}
      </text>
      <text color={theme.text.tertiary} size="small">
        GPT-4o response:
      </text>
      <text color={theme.text.secondary}>{submission.gpt4oResponse}</text>
      {submission.judgeDecision === 'rejected' && (
        <vstack gap="xsmall">
          <button
            appearance="secondary"
            text={expanded ? 'Hide judge feedback' : 'Show judge feedback'}
            onPress={() => setExpanded(!expanded)}
          />
          {expanded && (
            <text color={theme.accent.error}>{submission.judgeReasoning}</text>
          )}
        </vstack>
      )}
      {submission.judgeDecision === 'approved' && (
        <text color={theme.accent.success}>Approved by o4-mini</text>
      )}
    </vstack>
  );
};
