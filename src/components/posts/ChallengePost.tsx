import { Devvit, useEffect, useState } from '@devvit/public-api';
import { SubmissionForm } from '../../forms/SubmissionForm.js';
import type { Challenge, Submission } from '../../types/index.js';
import { SubmissionCard } from '../ui/SubmissionCard.js';
import { DiscordCTA } from '../ui/DiscordCTA.js';
import { listSubmissions, getChallenge, hasUserVoted, recordVote } from '../../utils/redis.js';
import { SUBMISSIONS_PER_PAGE, theme } from '../../config/constants.js';

export interface ChallengePostProps {
  challengeId: string;
}

type ChallengePostContextProps = ChallengePostProps & {
  metadata?: {
    userId?: string;
    username?: string;
  };
};

export const ChallengePost: Devvit.BlockComponent<ChallengePostProps> = (props: ChallengePostContextProps) => {
  const { challengeId, metadata } = props;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState(0);
  const [canVote, setCanVote] = useState(true);

  const load = async () => {
    const loadedChallenge = await getChallenge(challengeId);
    if (!loadedChallenge) {
      return;
    }
    setChallenge(loadedChallenge);
    const items = await listSubmissions(challengeId, page * SUBMISSIONS_PER_PAGE, SUBMISSIONS_PER_PAGE);
    setSubmissions(items.filter((submission) => submission.judgeDecision === 'approved'));
    if (metadata?.userId) {
      const alreadyVoted = await hasUserVoted(challengeId, metadata.userId);
      setCanVote(!alreadyVoted);
    } else {
      setCanVote(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, challengeId]);

  const handleSubmissionComplete = async () => {
    await load();
  };

  const handleVote = async (submission: Submission) => {
    if (!metadata?.userId) {
      return;
    }
    await recordVote(submission, metadata.userId);
    await load();
  };

  if (!challenge) {
    return (
      <vstack padding="large" backgroundColor={theme.bg.primary}>
        <text color={theme.text.primary}>Challenge not found.</text>
      </vstack>
    );
  }

  return (
    <vstack gap="large" padding="large" backgroundColor={theme.bg.primary}>
      <vstack gap="small">
        <text size="xlarge" weight="bold" color={theme.text.primary}>
          {challenge.title}
        </text>
        <text color={theme.text.secondary}>{challenge.description}</text>
        <text color={theme.text.tertiary}>
          Ends {new Date(challenge.endDate).toLocaleString()}
        </text>
      </vstack>

      <SubmissionForm challenge={challenge} onSubmissionComplete={handleSubmissionComplete} />

      <DiscordCTA />

      <vstack gap="medium">
        <text color={theme.text.primary} size="large" weight="bold">
          Approved submissions
        </text>
        {submissions.length === 0 ? (
          <text color={theme.text.secondary}>Be the first to get approved!</text>
        ) : (
          submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              canVote={canVote}
              onVote={handleVote}
            />
          ))
        )}
      </vstack>

      <hstack justifyContent="space-between">
        <button
          appearance="secondary"
          text="Previous"
          disabled={page === 0}
          onPress={() => setPage(Math.max(page - 1, 0))}
        />
        <button
          appearance="secondary"
          text="Next"
          onPress={() => setPage(page + 1)}
        />
      </hstack>
    </vstack>
  );
};
