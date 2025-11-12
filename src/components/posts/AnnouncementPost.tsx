import { Devvit } from '@devvit/public-api';
import { theme } from '../../config/constants.js';

export interface AnnouncementPostProps {
  title: string;
  subtitle: string;
  ctaUrl?: string;
}

export const AnnouncementPost: Devvit.BlockComponent<AnnouncementPostProps> = ({ title, subtitle, ctaUrl }) => (
  <vstack
    padding="xlarge"
    backgroundColor={theme.bg.primary}
    gap="large"
    cornerRadius="large"
  >
    <vstack gap="medium">
      <text size="xxlarge" weight="heavy" color={theme.accent.primary}>
        {title}
      </text>
      <text size="large" color={theme.text.secondary}>
        {subtitle}
      </text>
    </vstack>
    <hstack gap="large">
      <vstack gap="small">
        <text color={theme.text.primary} size="medium">
          • Automated GPT-4o verification
        </text>
        <text color={theme.text.primary} size="medium">
          • o4-mini judging with structured reasoning
        </text>
        <text color={theme.text.primary} size="medium">
          • Live leaderboards & Discord war room
        </text>
      </vstack>
    </hstack>
    {ctaUrl && (
      <button appearance="primary" text="Join the challenge" onPress={() => Devvit.openUrl(ctaUrl)} />
    )}
  </vstack>
);
