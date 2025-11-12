import { Devvit } from "@devvit/public-api";
import { getCostStats } from "../utils/redis.js";

export function registerViewStatsMenu() {
  Devvit.addMenuItem({
    label: "View API Cost Stats",
    location: "subreddit",
    onPress: async (_event, context) => {
      const stats = await getCostStats(context);
      await context.ui.showToast({
        appearance: "info",
        text: `GPT-4o: ${stats.gpt4o.submissions} submissions ($${stats.gpt4o.costUsd.toFixed(
          2,
        )}) | o4-mini: ${stats.o4mini.submissions} submissions ($${stats.o4mini.costUsd.toFixed(2)})`,
      });
    },
  });
}
