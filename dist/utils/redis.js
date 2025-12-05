import { Devvit } from '@devvit/public-api';
import { apiStatsKey, challengeKey, challengeListKey, challengeSlugKey, leaderboardApprovedKey, leaderboardVotesKey, submissionKey, submissionsKey, voteKey, } from '../types/redis-keys.js';
const redis = Devvit.createRedisClient();
export const redisClient = redis;
export async function saveChallenge(challenge) {
    await redis.hset(challengeKey(challenge.id), {
        id: challenge.id,
        slug: challenge.slug,
        title: challenge.title,
        description: challenge.description,
        systemPrompt: challenge.systemPrompt,
        model: challenge.model,
        intent: challenge.intent,
        outputObjective: challenge.outputObjective,
        inputObjective: challenge.inputObjective,
        requiredComponents: JSON.stringify(challenge.requiredComponents),
        endDate: String(challenge.endDate),
    });
    await redis.sadd(challengeListKey, challenge.id);
    await redis.set(challengeSlugKey(challenge.slug), challenge.id);
}
export async function getChallenge(challengeId) {
    const data = await redis.hgetall(challengeKey(challengeId));
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        systemPrompt: data.systemPrompt,
        model: data.model,
        intent: data.intent,
        outputObjective: data.outputObjective,
        inputObjective: data.inputObjective,
        requiredComponents: JSON.parse(data.requiredComponents ?? '[]'),
        endDate: Number(data.endDate ?? 0),
    };
}
export async function listChallenges() {
    const ids = await redis.smembers(challengeListKey);
    const items = await Promise.all(ids.map((id) => getChallenge(id)));
    return items.filter((c) => c !== null);
}
export async function saveSubmission(submission) {
    await redis.hset(submissionKey(submission.id), {
        id: submission.id,
        userId: submission.userId,
        username: submission.username,
        userPrompt: submission.userPrompt,
        gpt4oResponse: submission.gpt4oResponse,
        gpt4oTokens: JSON.stringify(submission.gpt4oTokens),
        judgeReasoning: submission.judgeReasoning,
        judgeDecision: submission.judgeDecision,
        judgeTokens: JSON.stringify(submission.judgeTokens),
        timestamp: String(submission.timestamp),
        challengeId: submission.challengeId,
        votes: String(submission.votes),
        voterIds: JSON.stringify(submission.voterIds),
    });
    await redis.zadd(submissionsKey(submission.challengeId), {
        score: submission.timestamp,
        member: submission.id,
    });
}
export async function getSubmission(submissionId) {
    const data = await redis.hgetall(submissionKey(submissionId));
    if (!data || Object.keys(data).length === 0) {
        return null;
    }
    return {
        id: data.id,
        userId: data.userId,
        username: data.username,
        userPrompt: data.userPrompt,
        gpt4oResponse: data.gpt4oResponse,
        gpt4oTokens: JSON.parse(data.gpt4oTokens ?? '{"input":0,"output":0}'),
        judgeReasoning: data.judgeReasoning,
        judgeDecision: data.judgeDecision,
        judgeTokens: JSON.parse(data.judgeTokens ?? '{"input":0,"output":0}'),
        timestamp: Number(data.timestamp ?? 0),
        challengeId: data.challengeId,
        votes: Number(data.votes ?? 0),
        voterIds: JSON.parse(data.voterIds ?? '[]'),
    };
}
export async function listSubmissions(challengeId, offset, limit) {
    const ids = await redis.zrevrange(submissionsKey(challengeId), offset, offset + limit - 1);
    const items = await Promise.all(ids.map((id) => getSubmission(id)));
    return items.filter((s) => s !== null);
}
export async function recordVote(submission, userId) {
    if (submission.voterIds.includes(userId)) {
        return;
    }
    submission.votes += 1;
    submission.voterIds.push(userId);
    await saveSubmission(submission);
    await redis.set(voteKey(submission.challengeId, userId), submission.id);
    await redis.zincrby(leaderboardVotesKey, 1, submission.userId);
}
export async function hasUserVoted(challengeId, userId) {
    const vote = await redis.get(voteKey(challengeId, userId));
    return Boolean(vote);
}
export async function updateLeaderboard(submission) {
    if (submission.judgeDecision === 'approved') {
        await redis.zincrby(leaderboardApprovedKey, 1, submission.userId);
    }
}
export async function getLeaderboard(limit) {
    const approvalEntries = await redis.zrevrange(leaderboardApprovedKey, 0, limit - 1, { withScores: true });
    const voteEntries = await redis.zrevrange(leaderboardVotesKey, 0, limit - 1, { withScores: true });
    const approvalMap = new Map();
    for (let i = 0; i < approvalEntries.length; i += 2) {
        approvalMap.set(approvalEntries[i], Number(approvalEntries[i + 1] ?? 0));
    }
    const voteMap = new Map();
    for (let i = 0; i < voteEntries.length; i += 2) {
        voteMap.set(voteEntries[i], Number(voteEntries[i + 1] ?? 0));
    }
    const userIds = new Set([...approvalMap.keys(), ...voteMap.keys()]);
    const leaderboard = Array.from(userIds).map((userId) => ({
        userId,
        username: userId,
        approvedSubmissions: approvalMap.get(userId) ?? 0,
        totalVotes: voteMap.get(userId) ?? 0,
    }));
    leaderboard.sort((a, b) => {
        if (b.approvedSubmissions !== a.approvedSubmissions) {
            return b.approvedSubmissions - a.approvedSubmissions;
        }
        return b.totalVotes - a.totalVotes;
    });
    return leaderboard.slice(0, limit);
}
export async function recordApiUsage(submission) {
    await redis.hincrby(apiStatsKey, 'totalSubmissions', 1);
    await redis.hincrby(apiStatsKey, 'gpt4oInput', submission.gpt4oTokens.input);
    await redis.hincrby(apiStatsKey, 'gpt4oOutput', submission.gpt4oTokens.output);
    await redis.hincrby(apiStatsKey, 'judgeInput', submission.judgeTokens.input);
    await redis.hincrby(apiStatsKey, 'judgeOutput', submission.judgeTokens.output);
}
export async function getApiStats() {
    const stats = await redis.hgetall(apiStatsKey);
    return stats;
}
