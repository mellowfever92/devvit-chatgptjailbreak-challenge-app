import { jsxs as _jsxs, jsx as _jsx } from "@devvit/public-api/jsx-runtime";
import { theme } from '../../config/constants.js';
export const JudgeFeedback = ({ submission }) => (_jsxs("vstack", { gap: "small", padding: "medium", backgroundColor: theme.bg.accent, cornerRadius: "medium", children: [_jsxs("text", { color: theme.text.primary, weight: "bold", children: ["Judge Decision: ", submission.judgeDecision.toUpperCase()] }), _jsx("text", { color: theme.text.secondary, children: submission.judgeReasoning })] }));
