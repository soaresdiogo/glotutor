export type WordScoreEntity = {
  status: 'green' | 'yellow' | 'red' | 'missed';
  similarity: number;
  confidence: number;
  phoneticMatch: boolean;
  combinedScore: number;
  expected: string;
  spoken: string;
  index: number;
};

export type ReadingSessionFeedbackEntity = {
  summary: string;
  tips: string[];
  focusWords: string[];
  /**
   * Suggested next activities or focus areas for the learner.
   */
  nextSteps?: string[];
  /**
   * High-level qualitative speed assessment (e.g. "slow", "ideal", "fast").
   */
  speed?: string;
  /**
   * High-level qualitative clarity assessment (e.g. "clear", "needs articulation").
   */
  clarity?: string;
  /**
   * High-level qualitative intonation assessment (e.g. "natural", "monotone").
   */
  intonation?: string;
};

export type GrammarItemEntity = {
  sentence: string;
  structure: string;
  explanation: string;
  pattern: string;
  level: string;
};

export type ReadingSessionEntity = {
  id: string;
  userId: string;
  textId: string;
  wordsPerMinute: number | null;
  accuracy: number | null;
  durationSeconds: number | null;
  wordsRead: number | null;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount: number;
  wordScores: WordScoreEntity[] | null;
  feedback: ReadingSessionFeedbackEntity | null;
  grammarItems: GrammarItemEntity[] | null;
  /**
   * Optional Azure pronunciation assessment scores when available.
   * These are stored separately from the derived overall metrics.
   */
  azurePronunciationScore?: number;
  azureAccuracyScore?: number;
  azureFluencyScore?: number;
  azureCompletenessScore?: number;
  /**
   * Optional, more detailed grammar analysis list.
   * Mirrors `grammarItems` but allows future separation without breaking compatibility.
   */
  grammarAnalysis?: GrammarItemEntity[];
  status: string;
  completedAt: Date | null;
};

export type CreateReadingSessionInput = {
  userId: string;
  textId: string;
  wordsPerMinute: number;
  accuracy: number;
  durationSeconds: number;
  wordsRead: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  missedCount: number;
  wordScores: WordScoreEntity[];
  azurePronunciationScore?: number;
  azureAccuracyScore?: number;
  azureFluencyScore?: number;
  azureCompletenessScore?: number;
};
