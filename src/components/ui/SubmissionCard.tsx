import { Devvit } from "@devvit/public-api";
import { Submission } from "../../types/index.js";
import { THEME } from "../../config/constants.js";

export interface SubmissionCardProps {
  submission: Submission;
  onVote?: (submissionId: string) => Promise<void> | void;
  canVote?: boolean;
}

export const SubmissionCard = Devvit.Blocks.Component<SubmissionCardProps>(
  ({ submission, onVote, canVote }) => {
    const status = submission.judgeDecision;
    const isApproved = status === "approved";
    const isRejected = status === "rejected";
    const borderColor = isApproved
      ? THEME.accent.success
      : isRejected
        ? THEME.accent.error
        : THEME.accent.warning;

    return (
      <vstack
        border={{ color: borderColor, width: "medium" }}
        padding="medium"
        gap="medium"
        cornerRadius="large"
        backgroundColor={THEME.bg.secondary}
      >
        <hstack justifyContent="space-between" alignItems="center">
          <text size="medium" weight="bold" color={THEME.text.primary}>
            {submission.username}
          </text>
          <text size="small" color={THEME.text.tertiary}>
            {new Date(submission.timestamp).toLocaleString()}
          </text>
        </hstack>

        <vstack gap="small">
          <text color={THEME.text.secondary}>Prompt</text>
          <text size="small" color={THEME.text.primary}>
            {submission.userPrompt}
          </text>
        </vstack>

        <vstack gap="small">
          <text color={THEME.text.secondary}>GPT-4o Response</text>
          <text size="small" color={THEME.text.primary}>
            {submission.gpt4oResponse}
          </text>
        </vstack>

        {status === "pending" && (
          <hstack alignItems="center" gap="small">
            <spacer grow />
            <text color={THEME.accent.warning} size="small">
              Pending automated review…
            </text>
          </hstack>
        )}

        {isRejected && (
          <vstack gap="small">
            <text color={THEME.accent.error} weight="bold">
              Rejected
            </text>
            <text size="small" color={THEME.text.secondary}>
              {submission.judgeReasoning}
            </text>
          </vstack>
        )}

        {isApproved && (
          <hstack alignItems="center" gap="medium">
            <text color={THEME.accent.success} weight="bold">
              Approved ✅
            </text>
            <text color={THEME.text.secondary}>
              Votes: {submission.votes}
            </text>
            {canVote && onVote && (
              <button
                appearance="primary"
                label="Upvote"
                onPress={() => onVote(submission.id)}
              />
            )}
          </hstack>
        )}
      </vstack>
    );
  },
);
