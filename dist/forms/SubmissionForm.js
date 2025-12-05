import { jsx as _jsx, jsxs as _jsxs } from "@devvit/public-api/jsx-runtime";
import { Devvit, useState } from '@devvit/public-api';
import { checkRateLimit, incrementRateLimit } from '../utils/rateLimit.js';
import { runTestPrompt } from '../utils/testPrompt.js';
import { judgeSubmission as runJudge } from '../utils/judgeSubmission.js';
import { saveSubmission, recordApiUsage, updateLeaderboard } from '../utils/redis.js';
import { theme } from '../config/constants.js';
export const SubmissionForm = (props) => {
    const { challenge, onSubmissionComplete, metadata } = props;
    const [prompt, setPrompt] = useState('');
    const [state, setState] = useState({ status: 'idle' });
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
            const submission = {
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
        }
        catch (error) {
            console.error(error);
            setState({ status: 'error', message: error.message });
        }
    };
    return (_jsxs("vstack", { gap: "medium", padding: "medium", backgroundColor: theme.bg.secondary, cornerRadius: "medium", children: [_jsx("text", { size: "large", color: theme.text.primary, weight: "bold", children: "Submit your jailbreak attempt" }), _jsx("textbox", { label: "Your prompt", placeholder: "Share your jailbreak prompt here", value: prompt, onChange: (value) => setPrompt(value), rows: 8 }), _jsx("button", { appearance: "primary", text: "Run verification", onPress: handleSubmit, disabled: prompt.trim().length === 0 || state.status === 'submitting' }), state.status === 'submitting' && (_jsx("text", { color: theme.accent.warning, children: "Testing and judging your prompt..." })), state.status === 'error' && (_jsx("text", { color: theme.accent.error, children: state.message })), state.status === 'result' && (_jsxs("vstack", { gap: "small", backgroundColor: theme.bg.accent, padding: "medium", cornerRadius: "medium", children: [_jsxs("text", { color: theme.text.primary, weight: "bold", children: ["Submission ", state.submission.judgeDecision === 'approved' ? 'approved!' : 'rejected'] }), _jsx("text", { color: theme.text.secondary, children: "Judge reasoning:" }), _jsx("text", { color: theme.text.primary, children: state.submission.judgeReasoning })] }))] }));
};
