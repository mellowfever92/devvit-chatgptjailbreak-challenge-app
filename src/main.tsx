import { Devvit, useState, useAsync } from "@devvit/public-api";
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
  description: "Submit jailbreak prompts and compete for leaderboard glory.",
  render: (context) => {
    const challenge = resolveChallenge(context.postData as Record<string, unknown> | undefined);
    const perPage = PAGINATION.submissionsPerPage;
    const userId = context.userId;
    const username = "user"; // Simplified for now

    const [page, setPage] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [rateLimitState, setRateLimitState] = useState({
      limited: false,
      remaining: RATE_LIMIT.submissionsPerHour,
    });

    const submissionsData = useAsync(
      async () => {
        const result = await listApprovedSubmissions(
          context,
          challenge.id,
          page * perPage,
          perPage,
        );
        return result as any; // Cast to any to satisfy JSONValue constraint
      },
      { depends: [page, refreshKey, challenge.id] }
    );

    const voteStatus = useAsync(
      async () => {
        if (!userId) return true;
        const result = await hasUserVoted(context, challenge.id, userId);
        return result as any;
      },
      { depends: [userId ?? "", challenge.id, refreshKey] }
    );

    const submissionsResult = submissionsData.data as any;
    const { submissions = [], total = 0 } = submissionsResult ?? { submissions: [], total: 0 };
    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / perPage));

    const handleSubmit = async (prompt: string): Promise<SubmissionFormResult> => {
      if (!userId) {
        return { success: false, error: "You must be logged in to submit." };
      }

      try {
        const limit = await checkRateLimit(context, challenge.id, userId);
        setRateLimitState({ limited: !limit.allowed as any, remaining: limit.remaining });
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
        context.ui.showToast("You must be logged in to vote.");
        return;
      }

      if (await hasUserVoted(context, challenge.id, userId)) {
        context.ui.showToast("You have already voted in this challenge.");
        return;
      }

      const submission = await getSubmission(context, challenge.id, submissionId);
      if (!submission || submission.judgeDecision !== "approved") {
        context.ui.showToast("Submission no longer available for voting.");
        return;
      }

      if (submission.userId === userId) {
        context.ui.showToast("You cannot vote for your own submission.");
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
  description: "Showcase the top jailbreakers for a challenge.",
  render: (context) => {
    const challenge = resolveChallenge(context.postData as Record<string, unknown> | undefined);

    const leaderboardData = useAsync(
      async () => {
        const result = await listLeaderboard(context, challenge.id, 20);
        return result as any;
      },
      { depends: [challenge.id, context.postId ?? ""] }
    );

    const leaderboard = (leaderboardData.data as any) ?? [];

    return (
      <vstack gap="large" padding="large">
        <LeaderboardPost challenge={challenge} leaderboard={leaderboard} />
        <DiscordCTA url="https://discord.gg/chatgptjailbreak" onPress={() => context.ui.navigateTo("https://discord.gg/chatgptjailbreak")} />
      </vstack>
    );
  },
});

Devvit.addCustomPostType({
  name: "announcement",
  description: "Announce upcoming jailbreak challenges with hero art.",
  render: (context) => {
    const metadata = context.postData as Record<string, unknown> | undefined;
    const challenge = resolveChallenge(metadata);
    const startDate = (metadata?.startDate as number | undefined) ?? Date.now();

    return (
      <AnnouncementPost challenge={challenge} startDate={startDate} />
    );
  },
});

export default Devvit;
