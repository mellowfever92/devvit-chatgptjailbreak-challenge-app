import { Devvit } from "@devvit/public-api";
import { useState, useAsync } from "@devvit/public-api/block-components";
import { PAGINATION, RATE_LIMIT } from "./config/constants.js";
import { CHALLENGES, getChallengeById } from "./config/challenges.js";
import { ChallengePost } from "./components/posts/ChallengePost.js";
import { LeaderboardPost } from "./components/posts/LeaderboardPost.js";
import { AnnouncementPost } from "./components/posts/AnnouncementPost.js";
import { SubmissionForm } from "./forms/SubmissionForm.js";
import { SubmissionFormResult } from "./forms/SubmissionForm.js";
import { Challenge } from "./types/index.js";
import {
  listApprovedSubmissions,
  storeSubmission,
  recordVote,
  getSubmission,
  listLeaderboard,
  getCostStats,
  updateCostStats,
  hasUserVoted,
  markUserVote,
} from "./utils/redis.js";
import { checkRateLimit } from "./utils/rateLimit.js";
import { testPrompt } from "./utils/testPrompt.js";
import { judgeSubmission as runJudge } from "./utils/judgeSubmission.js";
import { Submission } from "./types/index.js";
import { accumulateCosts, models } from "./config/openai.js";
import { registerCreateChallengeMenu } from "./menu-items/createChallenge.js";
import { registerCreateAnnouncementMenu } from "./menu-items/createAnnouncement.js";
import { registerViewStatsMenu } from "./menu-items/viewStats.js";
import { DiscordCTA } from "./components/ui/DiscordCTA.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});

// Configure OpenAI API Key setting (used in production on Reddit)
// For local development, the key is read from process.env.OPENAI_API_KEY (.env file)
// See src/config/openai.ts for the implementation
Devvit.addSettings([
  {
    type: "string",
    name: "openaiApiKey",
    label: "OpenAI API Key",
    helpText: "Your OpenAI API key for GPT-4o testing and o4-mini judging",
    isSecret: true,
    scope: "app",
  },
]);

registerCreateChallengeMenu();
registerCreateAnnouncementMenu();
registerViewStatsMenu();

function resolveChallenge(metadata: Record<string, unknown> | undefined): Challenge {
  const challengeId = (metadata?.challengeId as string | undefined) ?? CHALLENGES[0]!.id;
  const challenge = getChallengeById(challengeId);
  if (!challenge) {
    return CHALLENGES[0]!;
  }
  return challenge;
}

Devvit.addCustomPostType({
  name: "challenge",
  title: "Jailbreak Challenge",
  description: "Submit jailbreak prompts and compete for leaderboard glory.",
  render: (context) => {
    const challenge = resolveChallenge(context.post?.metadata as Record<string, unknown> | undefined);
    const perPage = PAGINATION.submissionsPerPage;
    const userId = context.userId ?? context.user?.id;
    const username = context.user?.username ?? context.user?.name ?? "anonymous";

    const [page, setPage] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [rateLimitState, setRateLimitState] = useState({
      limited: false,
      remaining: RATE_LIMIT.submissionsPerHour,
    });

    const submissionsData = useAsync(
      async () =>
        listApprovedSubmissions(
          context,
          challenge.id,
          page * perPage,
          perPage,
        ),
      [page, refreshKey, challenge.id],
    );

    const voteStatus = useAsync(
      async () => {
        if (!userId) return true;
        return hasUserVoted(context, challenge.id, userId);
      },
      [userId, challenge.id, refreshKey],
    );

    const { submissions = [], total = 0 } = submissionsData.data ?? { submissions: [], total: 0 };
    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / perPage));

    const handleSubmit = async (prompt: string): Promise<SubmissionFormResult> => {
      if (!userId) {
        return { success: false, error: "You must be logged in to submit." };
      }

      try {
        const limit = await checkRateLimit(context, challenge.id, userId);
        setRateLimitState({ limited: !limit.allowed, remaining: limit.remaining });
        if (!limit.allowed) {
          return { success: false, error: "Submission rate limit reached." };
        }

        const gptResult = await testPrompt(context, challenge.systemPrompt, prompt);
        const judge = await runJudge(context, challenge, prompt, gptResult.text);

        const submission: Submission = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          userId,
          username,
          userPrompt: prompt,
          gpt4oResponse: gptResult.text,
          gpt4oTokens: gptResult.usage,
          judgeReasoning: judge.reasoning,
          judgeDecision: judge.decision,
          judgeTokens: judge.usage,
          timestamp: Date.now(),
          challengeId: challenge.id,
          votes: 0,
          voterIds: [],
        };

        await storeSubmission(context, submission);

        const stats = await getCostStats(context);
        accumulateCosts(stats, models.gpt4o, gptResult.usage);
        accumulateCosts(stats, models.o4mini, judge.usage);
        await updateCostStats(context, stats);

        setRefreshKey((key) => key + 1);

        return {
          success: true,
          gpt4oResponse: gptResult.text,
          judgeReasoning: judge.reasoning,
          judgeDecision: judge.decision,
          gpt4oTokens: gptResult.usage,
          judgeTokens: judge.usage,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
      }
    };

    const handleVote = async (submissionId: string) => {
      if (!userId) {
        await context.ui.showToast({
          appearance: "danger",
          text: "You must be logged in to vote.",
        });
        return;
      }

      if (await hasUserVoted(context, challenge.id, userId)) {
        await context.ui.showToast({
          appearance: "warning",
          text: "You have already voted in this challenge.",
        });
        return;
      }

      const submission = await getSubmission(context, challenge.id, submissionId);
      if (!submission || submission.judgeDecision !== "approved") {
        await context.ui.showToast({
          appearance: "warning",
          text: "Submission no longer available for voting.",
        });
        return;
      }

      if (submission.userId === userId) {
        await context.ui.showToast({
          appearance: "warning",
          text: "You cannot vote for your own submission.",
        });
        return;
      }

      await recordVote(context, submission, userId);
      await markUserVote(context, challenge.id, userId);
      setRefreshKey((key) => key + 1);
      await context.ui.showToast({
        appearance: "success",
        text: "Vote recorded!",
      });
    };

    return (
      <ChallengePost
        challenge={challenge}
        submissions={submissions}
        currentPage={Math.min(page, totalPages - 1)}
        totalPages={totalPages}
        onNextPage={() => setPage((value) => Math.min(value + 1, totalPages - 1))}
        onPreviousPage={() => setPage((value) => Math.max(value - 1, 0))}
        onVote={handleVote}
        canVote={!voteStatus.data && Boolean(userId)}
        form={
          <SubmissionForm
            onSubmit={handleSubmit}
            isRateLimited={!userId || rateLimitState.limited}
            remainingSubmissions={userId ? rateLimitState.remaining : 0}
          />
        }
      />
    );
  },
});

Devvit.addCustomPostType({
  name: "leaderboard",
  title: "Challenge Leaderboard",
  description: "Showcase the top jailbreakers for a challenge.",
  render: (context) => {
    const challenge = resolveChallenge(context.post?.metadata as Record<string, unknown> | undefined);

    const leaderboardData = useAsync(
      () => listLeaderboard(context, challenge.id, 20),
      [challenge.id, context.post?.id],
    );

    return (
      <vstack gap="large" padding="large">
        <LeaderboardPost challenge={challenge} leaderboard={leaderboardData.data ?? []} />
        <DiscordCTA url="https://discord.gg/chatgptjailbreak" />
      </vstack>
    );
  },
});

Devvit.addCustomPostType({
  name: "announcement",
  title: "Challenge Announcement",
  description: "Announce upcoming jailbreak challenges with hero art.",
  render: (context) => {
    const metadata = context.post?.metadata as Record<string, unknown> | undefined;
    const challenge = resolveChallenge(metadata);
    const startDate = (metadata?.startDate as number | undefined) ?? Date.now();

    return (
      <AnnouncementPost challenge={challenge} startDate={startDate} />
    );
  },
});

export default Devvit;
