import { Devvit } from "@devvit/public-api";
import { CHALLENGES } from "../config/challenges.js";

const createChallengeForm = Devvit.createForm({
  title: "Launch Jailbreak Challenge",
  fields: [
    {
      type: "select",
      name: "challengeId",
      label: "Choose challenge",
      required: true,
      options: CHALLENGES.map((challenge) => ({
        label: challenge.title,
        value: challenge.id,
      })),
    },
    {
      type: "string",
      name: "headline",
      label: "Post headline (optional)",
      required: false,
    },
    {
      type: "string",
      name: "announcement",
      label: "Subreddit announcement blurb",
      required: false,
    },
  ],
});

export function registerCreateChallengeMenu() {
  Devvit.addMenuItem({
    label: "Create Jailbreak Challenge",
    location: "subreddit",
    onPress: async (event, context) => {
      const form = await context.ui.showForm(createChallengeForm);
      if (!form) return;

      const challenge = CHALLENGES.find((item) => item.id === form.challengeId);
      if (!challenge) {
        await context.ui.showToast({
          text: "Challenge not found.",
          appearance: "danger",
        });
        return;
      }

      await context.reddit.submitPost({
        subredditName: event.subreddit.name,
        title: form.headline?.trim() || `Jailbreak Challenge: ${challenge.title}`,
        kind: "custom",
        custom: {
          template: "challenge",
          metadata: {
            challengeId: challenge.id,
            announcement: form.announcement ?? "",
          },
        },
      });

      await context.ui.showToast({
        text: "Challenge post created!",
        appearance: "success",
      });
    },
  });
}
