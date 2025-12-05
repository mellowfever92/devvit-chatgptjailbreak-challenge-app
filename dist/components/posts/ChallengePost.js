import { jsx as _jsx, jsxs as _jsxs } from "@devvit/public-api/jsx-runtime";
import { useEffect, useState } from '@devvit/public-api';
import { SubmissionForm } from '../../forms/SubmissionForm.js';
import { SubmissionCard } from '../ui/SubmissionCard.js';
import { DiscordCTA } from '../ui/DiscordCTA.js';
import { listSubmissions, getChallenge, hasUserVoted, recordVote } from '../../utils/redis.js';
import { SUBMISSIONS_PER_PAGE, theme } from '../../config/constants.js';
export const ChallengePost = (props) => {
    const { challengeId, metadata } = props;
    const [challenge, setChallenge] = useState(null);
    const [submissions, setSubmissions] = useState([]);
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
        }
        else {
            setCanVote(false);
        }
    };
    useEffect(() => {
        void load();
    }, [page, challengeId]);
    const handleSubmissionComplete = async () => {
        await load();
    };
    const handleVote = async (submission) => {
        if (!metadata?.userId) {
            return;
        }
        await recordVote(submission, metadata.userId);
        await load();
    };
    if (!challenge) {
        return (_jsx("vstack", { padding: "large", backgroundColor: theme.bg.primary, children: _jsx("text", { color: theme.text.primary, children: "Challenge not found." }) }));
    }
    return (_jsxs("vstack", { gap: "large", padding: "large", backgroundColor: theme.bg.primary, children: [_jsxs("vstack", { gap: "small", children: [_jsx("text", { size: "xlarge", weight: "bold", color: theme.text.primary, children: challenge.title }), _jsx("text", { color: theme.text.secondary, children: challenge.description }), _jsxs("text", { color: theme.text.tertiary, children: ["Ends ", new Date(challenge.endDate).toLocaleString()] })] }), _jsx(SubmissionForm, { challenge: challenge, onSubmissionComplete: handleSubmissionComplete }), _jsx(DiscordCTA, {}), _jsxs("vstack", { gap: "medium", children: [_jsx("text", { color: theme.text.primary, size: "large", weight: "bold", children: "Approved submissions" }), submissions.length === 0 ? (_jsx("text", { color: theme.text.secondary, children: "Be the first to get approved!" })) : (submissions.map((submission) => (_jsx(SubmissionCard, { submission: submission, canVote: canVote, onVote: handleVote }, submission.id))))] }), _jsxs("hstack", { justifyContent: "space-between", children: [_jsx("button", { appearance: "secondary", text: "Previous", disabled: page === 0, onPress: () => setPage(Math.max(page - 1, 0)) }), _jsx("button", { appearance: "secondary", text: "Next", onPress: () => setPage(page + 1) })] })] }));
};
