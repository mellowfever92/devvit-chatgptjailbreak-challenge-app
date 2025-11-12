import { Devvit } from "@devvit/public-api";
import { Challenge, Submission } from "../../types/index.js";
import { THEME } from "../../config/constants.js";
import { SubmissionCard } from "../ui/SubmissionCard.js";
import { DiscordCTA } from "../ui/DiscordCTA.js";

export interface ChallengePostProps {
  challenge: Challenge;
  submissions: Submission[];
  currentPage: number;
  totalPages: number;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onVote?: (submissionId: string) => Promise<void> | void;
  canVote?: boolean;
  form?: JSX.Element;
  viewerHasSubmission?: boolean;
}

export const ChallengePost = ({
  challenge,
  submissions,
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
  onVote,
  canVote,
  form,
  viewerHasSubmission,
}: ChallengePostProps): JSX.Element => {
  return (
    <vstack
      gap="large"
      padding="large"
      backgroundColor={THEME.bg.primary}
    >
        <vstack gap="medium">
          <text size="xxlarge" weight="bold" color={THEME.text.primary}>
            {challenge.title}
          </text>
          <text color={THEME.text.secondary}>{challenge.description}</text>
        </vstack>

        <vstack gap="medium" backgroundColor={THEME.bg.accent} padding="large" cornerRadius="large">
          <text size="large" weight="bold" color={THEME.text.primary}>
            Intent
          </text>
          <text color={THEME.text.secondary}>{challenge.intent}</text>
          <text size="large" weight="bold" color={THEME.text.primary}>
            Output Objective
          </text>
          <text color={THEME.text.secondary}>{challenge.outputObjective}</text>
          <text size="large" weight="bold" color={THEME.text.primary}>
            Input Objective
          </text>
          <text color={THEME.text.secondary}>{challenge.inputObjective}</text>
          <text size="large" weight="bold" color={THEME.text.primary}>
            Required Components
          </text>
          <vstack gap="xsmall">
            {challenge.requiredComponents.map((component, index) => (
              <text key={index} color={THEME.text.secondary}>
                {index + 1}. {component}
              </text>
            ))}
          </vstack>
        </vstack>

        {form && (
          <vstack gap="medium" backgroundColor={THEME.bg.accent} padding="large" cornerRadius="large">
            <text size="large" weight="bold" color={THEME.text.primary}>
              Submit your jailbreak attempt
            </text>
            {viewerHasSubmission && (
              <text size="small" color={THEME.text.secondary}>
                You can submit multiple attempts, but they are rate-limited to prevent spam.
              </text>
            )}
            {form}
          </vstack>
        )}

        <vstack gap="medium">
          <hstack justifyContent="space-between" alignItems="center">
            <text size="large" weight="bold" color={THEME.text.primary}>
              Approved Submissions
            </text>
            <text size="small" color={THEME.text.secondary}>
              Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
            </text>
          </hstack>

          {submissions.length === 0 ? (
            <text color={THEME.text.secondary}>
              No approved submissions yet. Be the first to earn the jailbreak badge!
            </text>
          ) : (
            <vstack gap="medium">
              {submissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onVote={onVote}
                  canVote={canVote && submission.judgeDecision === "approved"}
                />
              ))}
            </vstack>
          )}

          <hstack justifyContent="space-between" alignItems="center">
            <button
              appearance="secondary"
              label="Previous"
              disabled={currentPage === 0}
              onPress={() => onPreviousPage?.()}
            />
            <button
              appearance="secondary"
              label="Next"
              disabled={currentPage + 1 >= totalPages}
              onPress={() => onNextPage?.()}
            />
          </hstack>
        </vstack>

        <DiscordCTA url="https://discord.gg/chatgptjailbreak" onPress={() => {/* Navigation handled by parent */}} />
      </vstack>
    );
};
