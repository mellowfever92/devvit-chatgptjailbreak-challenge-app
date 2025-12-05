import { Devvit } from '@devvit/public-api';

interface AnnouncementFormValues {
  title: string;
  subtitle: string;
  link: string;
}

export function registerCreateAnnouncementMenu() {
  Devvit.addMenuItem({
    label: 'Create Jailbreak Announcement',
    location: 'subreddit',
    forUserType: 'moderator',
    async onPress(event) {
      const form = await event.showForm<AnnouncementFormValues>({
        title: 'Announcement details',
        fields: [
          { name: 'title', label: 'Title', type: 'string', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'string', required: true },
          { name: 'link', label: 'Call-to-action URL', type: 'string' },
        ],
      });

      await event.api.submitPost({
        title: form.values.title,
        subredditName: event.subreddit.name,
        preview: <announcementpost title={form.values.title} subtitle={form.values.subtitle} ctaUrl={form.values.link} />,
      });

      await event.ui.showToast({ text: 'Announcement posted!' });
    },
  });
}
