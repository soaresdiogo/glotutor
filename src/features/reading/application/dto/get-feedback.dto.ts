export type GetFeedbackDto = {
  wordScores: Array<{ status: string; expected?: string }>;
  wpm: number;
  level: string;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount: number;
};
