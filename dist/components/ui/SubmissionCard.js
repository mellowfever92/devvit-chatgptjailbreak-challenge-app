import { jsx as _jsx, jsxs as _jsxs } from "@devvit/public-api/jsx-runtime";
import { useState } from '@devvit/public-api';
import { theme } from '../../config/constants.js';
export const SubmissionCard = ({ submission, onVote, canVote }) => {
    const [expanded, setExpanded] = useState(false);
    const borderColor = submission.judgeDecision === 'approved'
        ? theme.accent.success
        : submission.judgeDecision === 'rejected'
            ? theme.accent.error
            : theme.accent.warning;
    return (_jsxs("vstack", { gap: "small", padding: "medium", cornerRadius: "medium", borderWidth: "medium", borderColor: borderColor, backgroundColor: theme.bg.secondary, children: [_jsxs("hstack", { justifyContent: "space-between", alignItems: "center", children: [_jsx("text", { color: theme.text.primary, weight: "bold", children: submission.username }), submission.judgeDecision === 'approved' && (_jsxs("hstack", { gap: "small", alignItems: "center", children: [_jsx("icon", { name: "upvote-filled", color: theme.accent.success }), _jsx("text", { color: theme.text.primary, children: submission.votes }), _jsx("button", { text: "Vote", appearance: "primary", disabled: !canVote, onPress: () => canVote && onVote?.(submission) })] }))] }), _jsx("text", { color: theme.text.secondary, children: submission.userPrompt }), _jsx("text", { color: theme.text.tertiary, size: "small", children: "GPT-4o response:" }), _jsx("text", { color: theme.text.secondary, children: submission.gpt4oResponse }), submission.judgeDecision === 'rejected' && (_jsxs("vstack", { gap: "xsmall", children: [_jsx("button", { appearance: "secondary", text: expanded ? 'Hide judge feedback' : 'Show judge feedback', onPress: () => setExpanded(!expanded) }), expanded && (_jsx("text", { color: theme.accent.error, children: submission.judgeReasoning }))] })), submission.judgeDecision === 'approved' && (_jsx("text", { color: theme.accent.success, children: "Approved by o4-mini" }))] }));
};
