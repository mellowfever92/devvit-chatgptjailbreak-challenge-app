import { Devvit } from "@devvit/public-api";
import { THEME } from "../../config/constants.js";

export interface DiscordCTAProps {
  url: string;
  onPress: () => void;
}

export const DiscordCTA = ({ url, onPress }: DiscordCTAProps): JSX.Element => (
  <vstack
    backgroundColor={THEME.bg.accent}
    padding="medium"
    gap="small"
    cornerRadius="large"
  >
    <text color={THEME.text.primary} size="medium" weight="bold">
      Join the Jailbreak Ops Discord
    </text>
    <text color={THEME.text.secondary} size="small">
      Collaborate with 300k+ jailbreakers, share tactics, and get real-time challenge alerts.
    </text>
    <button
      appearance="primary"
      onPress={onPress}
    >
      Join Discord
    </button>
  </vstack>
);
