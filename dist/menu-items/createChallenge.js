import { jsx as _jsx } from "@devvit/public-api/jsx-runtime";
import { Devvit } from '@devvit/public-api';
import { challenges } from '../config/challenges.js';
import { saveChallenge } from '../utils/redis.js';
export function registerCreateChallengeMenu() {
    Devvit.addMenuItem({
        label: 'Launch Jailbreak Challenge',
        location: 'subreddit',
        forUserType: 'moderator',
        async onPress(event) {
            const form = await event.showForm({
                title: 'Launch jailbreak challenge',
                fields: [
                    {
                        name: 'challenge',
                        label: 'Challenge',
                        type: 'select',
                        options: challenges.map((challenge) => ({ label: challenge.title, value: challenge.id })),
                    },
                    {
                        name: 'announcementTitle',
                        label: 'Announcement headline',
                        type: 'string',
                    },
                ],
            });
            const challenge = challenges.find((item) => item.id === form.values.challenge);
            if (!challenge) {
                await event.ui.showToast({ text: 'Challenge not found.' });
                return;
            }
            await saveChallenge(challenge);
            await event.api.submitPost({
                title: `Challenge: ${challenge.title}`,
                subredditName: event.subreddit.name,
                preview: _jsx("challengepost", { challengeId: challenge.id }),
            });
            if (form.values.announcementTitle) {
                await event.api.submitPost({
                    title: form.values.announcementTitle,
                    subredditName: event.subreddit.name,
                    preview: _jsx("announcementpost", { title: form.values.announcementTitle, subtitle: challenge.description }),
                });
            }
            await event.ui.showToast({ text: 'Challenge launched!' });
        },
    });
}
