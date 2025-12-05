import { jsx as _jsx, jsxs as _jsxs } from "@devvit/public-api/jsx-runtime";
import { Devvit } from '@devvit/public-api';
import { theme } from '../../config/constants.js';
export const DiscordCTA = () => (_jsxs("vstack", { padding: "medium", backgroundColor: theme.bg.accent, cornerRadius: "large", gap: "small", children: [_jsx("text", { color: theme.text.primary, weight: "bold", size: "large", children: "Join the r/ChatGPTJailbreak Discord" }), _jsx("text", { color: theme.text.secondary, children: "Connect with 300k+ rebels strategizing jailbreaks, sharing techniques, and cheering on winners." }), _jsx("button", { appearance: "primary", text: "Enter the War Room", onPress: () => Devvit.openUrl('https://discord.gg/chatgptjailbreak') })] }));
