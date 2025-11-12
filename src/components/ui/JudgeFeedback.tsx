import { Devvit } from '@devvit/public-api';
import type { Submission } from '../../types/index.js';
import { theme } from '../../config/constants.js';

export interface JudgeFeedbackProps {
  submission: Submission;
}

export const JudgeFeedback: Devvit.BlockComponent<JudgeFeedbackProps> = ({ submission }) => (
  <vstack gap="small" padding="medium" backgroundColor={theme.bg.accent} cornerRadius="medium">
    <text color={theme.text.primary} weight="bold">
      Judge Decision: {submission.judgeDecision.toUpperCase()}
    </text>
    <text color={theme.text.secondary}>{submission.judgeReasoning}</text>
  </vstack>
);
