import { Devvit } from "@devvit/public-api";
import { Submission, LeaderboardEntry, CostStats } from "../types/index.js";
import { redisKeys } from "../types/redis-keys.js";
import { createEmptyCostStats } from "../config/openai.js";

function serializeSubmission(submission: Submission): string {
  return JSON.stringify(submission);
}

function deserializeSubmission(value: string | null): Submission | null {
  if (!value) return null;
  return JSON.parse(value) as Submission;
}

export async function storeSubmission(
  context: Devvit.Context,
  submission: Submission,
): Promise<void> {
  const key = redisKeys.submission(submission.challengeId, submission.id);
  await context.redis.set(key, serializeSubmission(submission));
  await context.redis.zAdd(redisKeys.submissions(submission.challengeId), {
    score: submission.timestamp,
    member: submission.id,
  });
}

export async function updateSubmission(
  context: Devvit.Context,
  submission: Submission,
): Promise<void> {
  await storeSubmission(context, submission);
}

export async function getSubmission(
  context: Devvit.Context,
  challengeId: string,
  submissionId: string,
): Promise<Submission | null> {
  const key = redisKeys.submission(challengeId, submissionId);
  const value = await context.redis.get(key);
  return deserializeSubmission(value);
}

export async function listSubmissions(
  context: Devvit.Context,
  challengeId: string,
  offset: number,
  limit: number,
): Promise<Submission[]> {
  const ids = await context.redis.zRevRange(
    redisKeys.submissions(challengeId),
    offset,
    offset + limit - 1,
  );

  if (!ids.length) {
    return [];
  }

  const pipeline = context.redis.pipeline();
  for (const id of ids) {
    pipeline.get(redisKeys.submission(challengeId, id));
  }
  const results = await pipeline.exec();
  return results
    .map(([, value]) => deserializeSubmission(value as string))
    .filter((submission): submission is Submission => Boolean(submission))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function listApprovedSubmissions(
  context: Devvit.Context,
  challengeId: string,
  offset: number,
  limit: number,
): Promise<{ submissions: Submission[]; total: number }> {
  const totalRecords = await context.redis.zCard(redisKeys.submissions(challengeId));
  const batchSize = Math.max(limit * 3, limit);

  let totalApproved = 0;
  const submissions: Submission[] = [];
  let approvedSeen = 0;

  for (let index = 0; index < totalRecords; index += batchSize) {
    const chunk = await listSubmissions(context, challengeId, index, batchSize);
    if (!chunk.length) break;
    const approved = chunk.filter((submission) => submission.judgeDecision === "approved");
    totalApproved += approved.length;

    if (approvedSeen + approved.length <= offset) {
      approvedSeen += approved.length;
      if (chunk.length < batchSize) break;
      continue;
    }

    const startIndex = Math.max(0, offset - approvedSeen);
    for (let i = startIndex; i < approved.length && submissions.length < limit; i += 1) {
      submissions.push(approved[i]!);
    }
    approvedSeen += approved.length;

    if (submissions.length >= limit || chunk.length < batchSize) {
      if (chunk.length < batchSize) {
        break;
      }
      if (submissions.length >= limit) {
        break;
      }
    }
  }

  return {
    submissions: submissions.slice(0, limit),
    total: totalApproved,
  };
}

export async function recordVote(
  context: Devvit.Context,
  submission: Submission,
  voterId: string,
): Promise<Submission> {
  if (submission.voterIds.includes(voterId)) {
    return submission;
  }

  submission.votes += 1;
  submission.voterIds.push(voterId);
  await updateSubmission(context, submission);

  await context.redis.zAdd(redisKeys.leaderboard(submission.challengeId), {
    score: submission.votes,
    member: `${submission.userId}:${submission.username}`,
  });

  return submission;
}

export async function hasUserVoted(
  context: Devvit.Context,
  challengeId: string,
  userId: string,
): Promise<boolean> {
  const key = redisKeys.vote(challengeId, userId);
  const value = await context.redis.get(key);
  return value === "1";
}

export async function markUserVote(
  context: Devvit.Context,
  challengeId: string,
  userId: string,
): Promise<void> {
  const key = redisKeys.vote(challengeId, userId);
  await context.redis.set(key, "1");
}

export async function listLeaderboard(
  context: Devvit.Context,
  challengeId: string,
  limit = 10,
): Promise<LeaderboardEntry[]> {
  const entries = await context.redis.zRevRangeWithScores(
    redisKeys.leaderboard(challengeId),
    0,
    limit - 1,
  );

  return entries.map((entry) => {
    const [userId, username] = entry.member.split(":");
    return {
      userId,
      username: username ?? "Unknown",
      score: entry.score,
      submissions: entry.score,
    } satisfies LeaderboardEntry;
  });
}

export async function getCostStats(
  context: Devvit.Context,
): Promise<CostStats> {
  const raw = await context.redis.get(redisKeys.stats);
  if (!raw) {
    return createEmptyCostStats();
  }
  return JSON.parse(raw) as CostStats;
}

export async function updateCostStats(
  context: Devvit.Context,
  stats: CostStats,
): Promise<void> {
  await context.redis.set(redisKeys.stats, JSON.stringify(stats));
}

export async function getUserRateLimit(
  context: Devvit.Context,
  challengeId: string,
  userId: string,
): Promise<number[]> {
  const raw = await context.redis.get(redisKeys.rateLimit(challengeId, userId));
  if (!raw) return [];
  return JSON.parse(raw) as number[];
}

export async function updateUserRateLimit(
  context: Devvit.Context,
  challengeId: string,
  userId: string,
  timestamps: number[],
): Promise<void> {
  await context.redis.set(
    redisKeys.rateLimit(challengeId, userId),
    JSON.stringify(timestamps),
    {
      expireIn: 60 * 60, // one hour
    },
  );
}
