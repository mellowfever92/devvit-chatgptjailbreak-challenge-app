import { Devvit } from '@devvit/public-api';
import { ChallengePost } from './components/posts/ChallengePost.js';
import { LeaderboardPost } from './components/posts/LeaderboardPost.js';
import { AnnouncementPost } from './components/posts/AnnouncementPost.js';
import { registerCreateChallengeMenu } from './menu-items/createChallenge.js';
import { registerCreateAnnouncementMenu } from './menu-items/createAnnouncement.js';
import { registerViewStatsMenu } from './menu-items/viewStats.js';
import { challenges } from './config/challenges.js';
import { saveChallenge } from './utils/redis.js';

Devvit.addCustomPost({
  name: 'challengepost',
  description: 'Displays jailbreak challenge details and submissions.',
  render: ChallengePost,
});

Devvit.addCustomPost({
  name: 'leaderboardpost',
  description: 'Shows the global jailbreak leaderboard.',
  render: LeaderboardPost,
});

Devvit.addCustomPost({
  name: 'announcementpost',
  description: 'Hero announcement for jailbreak challenges.',
  render: AnnouncementPost,
});

registerCreateChallengeMenu();
registerCreateAnnouncementMenu();
registerViewStatsMenu();

Devvit.addSchedulerJob({
  name: 'sync-default-challenges',
  onRun: async () => {
    await Promise.all(challenges.map((challenge) => saveChallenge(challenge)));
  },
});

Devvit.addTrigger({
  events: ['AppInstall'],
  onEvent: async () => {
    await Promise.all(challenges.map((challenge) => saveChallenge(challenge)));
  },
});

export default Devvit;
