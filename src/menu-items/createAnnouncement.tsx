import { Devvit } from "@devvit/public-api";
import { CHALLENGES } from "../config/challenges.js";

const announcementForm = Devvit.createForm({
  title: "Create Challenge Announcement",
  fields: [
    {
      type: "select",
      name: "challengeId",
      label: "Which challenge?",
      required: true,
      options: CHALLENGES.map((challenge) => ({
        label: challenge.title,
        value: challenge.id,
      })),
    },
    {
      type: "datetime",
      name: "startDate",
      label: "Start date",
      required: true,
    },
    {
      type: "string",
      name: "title",
      label: "Announcement title",
      required: false,
    },
  ],
});

export function registerCreateAnnouncementMenu() {
  Devvit.addMenuItem({
    label: "Create Challenge Announcement",
    location: "subreddit",
    onPress: async (event, context) => {
      const form = await context.ui.showForm(announcementForm);
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
        title: form.title?.trim() || `Announcement: ${challenge.title}`,
        kind: "custom",
        custom: {
          template: "announcement",
          metadata: {
            challengeId: challenge.id,
            startDate: new Date(form.startDate).getTime(),
          },
        },
      });

      await context.ui.showToast({
        text: "Announcement post created!",
        appearance: "success",
      });
    },
  });
}
