import { Devvit, useEffect, useState } from '@devvit/public-api';
import { getLeaderboard } from '../../utils/redis.js';
import { LEADERBOARD_LIMIT, theme } from '../../config/constants.js';
import type { LeaderboardEntry } from '../../types/index.js';

export const LeaderboardPost: Devvit.BlockComponent = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    void (async () => {
      const data = await getLeaderboard(LEADERBOARD_LIMIT);
      setEntries(data);
    })();
  }, []);

  return (
    <vstack padding="large" gap="medium" backgroundColor={theme.bg.primary}>
      <text size="xlarge" weight="bold" color={theme.text.primary}>
        Jailbreak Champions Leaderboard
      </text>
      {entries.length === 0 ? (
        <text color={theme.text.secondary}>No approved submissions yet.</text>
      ) : (
        entries.map((entry, index) => (
          <hstack key={entry.userId} justifyContent="space-between" backgroundColor={theme.bg.secondary} padding="medium" cornerRadius="medium">
            <hstack gap="small">
              <text color={theme.text.primary} weight="bold">
                #{index + 1}
              </text>
              <text color={theme.text.primary}>{entry.username}</text>
            </hstack>
            <hstack gap="small">
              <text color={theme.text.secondary}>Approved:</text>
              <text color={theme.text.primary}>{entry.approvedSubmissions}</text>
              <text color={theme.text.secondary}>Votes:</text>
              <text color={theme.text.primary}>{entry.totalVotes}</text>
            </hstack>
          </hstack>
        ))
      )}
    </vstack>
  );
};
