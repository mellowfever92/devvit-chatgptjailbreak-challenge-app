import { jsx as _jsx } from "@devvit/public-api/jsx-runtime";
import { Devvit } from '@devvit/public-api';
export function registerCreateAnnouncementMenu() {
    Devvit.addMenuItem({
        label: 'Create Jailbreak Announcement',
        location: 'subreddit',
        forUserType: 'moderator',
        async onPress(event) {
            const form = await event.showForm({
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
                preview: _jsx("announcementpost", { title: form.values.title, subtitle: form.values.subtitle, ctaUrl: form.values.link }),
            });
            await event.ui.showToast({ text: 'Announcement posted!' });
        },
    });
}
