import { Devvit } from '@devvit/public-api';
import { getApiStats } from '../utils/redis.js';
import { COST_ESTIMATES } from '../config/constants.js';
export function registerViewStatsMenu() {
    Devvit.addMenuItem({
        label: 'View AI Usage Stats',
        location: 'modhub',
        forUserType: 'moderator',
        async onPress(event) {
            const stats = await getApiStats();
            const totalSubmissions = Number(stats?.totalSubmissions ?? 0);
            const gpt4oInput = Number(stats?.gpt4oInput ?? 0);
            const gpt4oOutput = Number(stats?.gpt4oOutput ?? 0);
            const judgeInput = Number(stats?.judgeInput ?? 0);
            const judgeOutput = Number(stats?.judgeOutput ?? 0);
            const estimatedCost = totalSubmissions * (COST_ESTIMATES.gpt4oPerSubmissionUsd + COST_ESTIMATES.judgePerSubmissionUsd);
            await event.ui.showToast({
                text: `Submissions: ${totalSubmissions} | GPT-4o tokens: ${gpt4oInput}/${gpt4oOutput} | o4-mini tokens: ${judgeInput}/${judgeOutput} | Est. Cost: $${estimatedCost.toFixed(2)}`,
            });
        },
    });
}
