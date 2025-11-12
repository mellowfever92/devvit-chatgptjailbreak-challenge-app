import { Devvit } from "@devvit/public-api";
import { LeaderboardEntry, Challenge } from "../../types/index.js";
import { THEME } from "../../config/constants.js";

export interface LeaderboardPostProps {
  challenge: Challenge;
  leaderboard: LeaderboardEntry[];
}

export const LeaderboardPost = ({ challenge, leaderboard }: LeaderboardPostProps): JSX.Element => (
  <vstack padding="large" gap="large" backgroundColor={THEME.bg.primary}>
    <vstack gap="small">
      <text size="xxlarge" weight="bold" color={THEME.text.primary}>
        {challenge.title} Leaderboard
      </text>
      <text color={THEME.text.secondary}>
        Celebrating the top jailbreak tacticians cracking this prompt.
      </text>
    </vstack>

    <vstack gap="small">
      {leaderboard.length === 0 ? (
        <text color={THEME.text.secondary}>
          No approved submissions yet. Rally your crew and take first place!
        </text>
      ) : (
        leaderboard.map((entry, index) => (
          <hstack
            gap="medium"
            padding="medium"
            backgroundColor={THEME.bg.accent}
            cornerRadius="large"
          >
            <text size="large" weight="bold" color={THEME.text.primary}>
              #{index + 1}
            </text>
            <vstack gap="small">
              <text weight="bold" color={THEME.text.primary}>
                {entry.username}
              </text>
              <text size="small" color={THEME.text.secondary}>
                Score: {entry.score} • Approved submissions: {entry.submissions}
              </text>
            </vstack>
          </hstack>
        ))
      )}
    </vstack>
  </vstack>
);
