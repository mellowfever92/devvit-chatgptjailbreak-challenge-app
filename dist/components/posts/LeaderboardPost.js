import { jsx as _jsx, jsxs as _jsxs } from "@devvit/public-api/jsx-runtime";
import { useEffect, useState } from '@devvit/public-api';
import { getLeaderboard } from '../../utils/redis.js';
import { LEADERBOARD_LIMIT, theme } from '../../config/constants.js';
export const LeaderboardPost = () => {
    const [entries, setEntries] = useState([]);
    useEffect(() => {
        void (async () => {
            const data = await getLeaderboard(LEADERBOARD_LIMIT);
            setEntries(data);
        })();
    }, []);
    return (_jsxs("vstack", { padding: "large", gap: "medium", backgroundColor: theme.bg.primary, children: [_jsx("text", { size: "xlarge", weight: "bold", color: theme.text.primary, children: "Jailbreak Champions Leaderboard" }), entries.length === 0 ? (_jsx("text", { color: theme.text.secondary, children: "No approved submissions yet." })) : (entries.map((entry, index) => (_jsxs("hstack", { justifyContent: "space-between", backgroundColor: theme.bg.secondary, padding: "medium", cornerRadius: "medium", children: [_jsxs("hstack", { gap: "small", children: [_jsxs("text", { color: theme.text.primary, weight: "bold", children: ["#", index + 1] }), _jsx("text", { color: theme.text.primary, children: entry.username })] }), _jsxs("hstack", { gap: "small", children: [_jsx("text", { color: theme.text.secondary, children: "Approved:" }), _jsx("text", { color: theme.text.primary, children: entry.approvedSubmissions }), _jsx("text", { color: theme.text.secondary, children: "Votes:" }), _jsx("text", { color: theme.text.primary, children: entry.totalVotes })] })] }, entry.userId))))] }));
};
