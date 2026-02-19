import type {
  CreateReadingSessionInput,
  GrammarItemEntity,
  ReadingSessionEntity,
  ReadingSessionFeedbackEntity,
} from '../entities/reading-session.entity';

export type ComprehensionAnswerEntry = {
  answer: string;
  correct: boolean;
};

export type LastSessionResult = {
  sessionId: string;
  wordScores: CreateReadingSessionInput['wordScores'];
  metrics: {
    wpm: number;
    accuracy: number;
    duration: number;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    missedCount: number;
  };
  feedback: ReadingSessionFeedbackEntity | null;
  grammarItems: GrammarItemEntity[];
  /**
   * Optional Azure pronunciation assessment scores when available.
   */
  azurePronunciationScore?: number;
  azureAccuracyScore?: number;
  azureFluencyScore?: number;
  azureCompletenessScore?: number;
  /**
   * Optional, richer grammar analysis view.
   * Aliases `grammarItems` but can diverge in the future without breaking callers.
   */
  grammarAnalysis?: GrammarItemEntity[];
  /**
   * Saved comprehension answers per question key: { [questionKey]: { answer, correct } }.
   */
  comprehensionAnswers?: Record<string, ComprehensionAnswerEntry> | null;
};

export interface IReadingSessionRepository {
  create(data: CreateReadingSessionInput): Promise<ReadingSessionEntity>;
  findLatestCompletedByUserAndText(
    userId: string,
    textId: string,
  ): Promise<LastSessionResult | null>;
  /** Text IDs the user has at least one completed reading session for. */
  findCompletedTextIdsByUser(userId: string): Promise<string[]>;
  updateFeedback(
    sessionId: string,
    userId: string,
    feedback: ReadingSessionFeedbackEntity,
    grammarItems: GrammarItemEntity[],
  ): Promise<boolean>;
  updateComprehensionAnswers(
    sessionId: string,
    userId: string,
    answers: Record<string, ComprehensionAnswerEntry>,
  ): Promise<boolean>;
}
