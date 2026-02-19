export type FeedbackStats = {
  wordScores: Array<{ status: string; expected?: string }>;
  wpm: number;
  level: string;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount: number;
};

export type FeedbackResult = {
  summary: string;
  tips: string[];
  focusWords: string[];
  nextSteps: string[];
  /**
   * High-level qualitative speed assessment (e.g. "slow", "ideal", "fast").
   */
  speed?: string;
  /**
   * High-level qualitative clarity assessment.
   */
  clarity?: string;
  /**
   * High-level qualitative intonation assessment.
   */
  intonation?: string;
};

export interface IFeedbackAIService {
  generateFeedback(stats: FeedbackStats): Promise<FeedbackResult>;
}
