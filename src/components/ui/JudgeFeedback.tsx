import { Devvit } from "@devvit/public-api";
import { THEME } from "../../config/constants.js";

export interface JudgeFeedbackProps {
  reasoning: string;
  decision: "approved" | "rejected" | "pending";
}

export const JudgeFeedback = ({ reasoning, decision }: JudgeFeedbackProps): JSX.Element => {
  const color =
    decision === "approved"
      ? THEME.accent.success
      : decision === "rejected"
        ? THEME.accent.error
        : THEME.accent.warning;

  return (
    <vstack
      backgroundColor={THEME.bg.accent}
      cornerRadius="large"
      padding="medium"
      gap="small"
    >
      <text color={color} weight="bold">
        Judge Decision: {decision.toUpperCase()}
      </text>
      <text size="small" color={THEME.text.secondary}>
        {reasoning}
      </text>
    </vstack>
  );
};
