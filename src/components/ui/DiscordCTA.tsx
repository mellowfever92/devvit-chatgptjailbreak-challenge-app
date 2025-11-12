import { Devvit } from "@devvit/public-api";
import { THEME } from "../../config/constants.js";

export interface DiscordCTAProps {
  url: string;
}

export const DiscordCTA = Devvit.Blocks.Component<DiscordCTAProps>(
  ({ url }, context) => (
    <vstack
      backgroundColor={THEME.bg.accent}
      padding="medium"
      gap="small"
      cornerRadius="large"
      border={{ color: THEME.accent.primary, width: "medium" }}
    >
      <text color={THEME.text.primary} size="medium" weight="bold">
        Join the Jailbreak Ops Discord
      </text>
      <text color={THEME.text.secondary} size="small">
        Collaborate with 300k+ jailbreakers, share tactics, and get real-time challenge alerts.
      </text>
      <button
        appearance="primary"
        label="Join Discord"
        onPress={() => context.ui.navigateTo(url)}
      />
    </vstack>
  ),
);
