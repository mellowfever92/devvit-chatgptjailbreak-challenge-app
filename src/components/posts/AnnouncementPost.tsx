import { Devvit } from "@devvit/public-api";
import { Challenge } from "../../types/index.js";
import { THEME } from "../../config/constants.js";

export interface AnnouncementPostProps {
  challenge: Challenge;
  startDate: number;
}

export const AnnouncementPost = Devvit.Blocks.Component<AnnouncementPostProps>(
  ({ challenge, startDate }) => (
    <vstack
      padding="xxlarge"
      gap="large"
      backgroundColor={THEME.bg.primary}
      border={{ color: THEME.accent.primary, width: "large" }}
      cornerRadius="xxlarge"
    >
      <vstack gap="medium">
        <text size="xxlarge" weight="bold" color={THEME.accent.primary}>
          🚨 New Jailbreak Challenge Incoming
        </text>
        <text size="xlarge" weight="bold" color={THEME.text.primary}>
          {challenge.title}
        </text>
        <text color={THEME.text.secondary} size="medium">
          {challenge.description}
        </text>
      </vstack>

      <vstack gap="small">
        <text color={THEME.text.secondary}>Objective</text>
        <text color={THEME.text.primary}>{challenge.intent}</text>
      </vstack>

      <vstack gap="small">
        <text color={THEME.text.secondary}>Launch Window</text>
        <text color={THEME.text.primary}>
          Starts {new Date(startDate).toLocaleString()} • Ends {new Date(challenge.endDate).toLocaleString()}
        </text>
      </vstack>

      <text color={THEME.accent.success} size="medium" weight="bold">
        Prime your jailbreak prompts and rally your squad. Submissions open soon!
      </text>
    </vstack>
  ),
);
