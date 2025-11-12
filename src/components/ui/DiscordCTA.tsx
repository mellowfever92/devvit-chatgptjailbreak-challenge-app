import { Devvit } from '@devvit/public-api';
import { theme } from '../../config/constants.js';

export const DiscordCTA: Devvit.BlockComponent = () => (
  <vstack
    padding="medium"
    backgroundColor={theme.bg.accent}
    cornerRadius="large"
    gap="small"
  >
    <text color={theme.text.primary} weight="bold" size="large">
      Join the r/ChatGPTJailbreak Discord
    </text>
    <text color={theme.text.secondary}>
      Connect with 300k+ rebels strategizing jailbreaks, sharing techniques, and cheering on winners.
    </text>
    <button
      appearance="primary"
      text="Enter the War Room"
      onPress={() => Devvit.openUrl('https://discord.gg/chatgptjailbreak')}
    />
  </vstack>
);
