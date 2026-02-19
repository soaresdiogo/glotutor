export type WordEvaluationStatus = 'green' | 'yellow' | 'red' | 'missed';

export interface IReadingEvaluationService {
  /**
   * Evaluate pronunciation per word using AI (strict, human-tutor style).
   * Returns one status per expected word.
   */
  evaluateWordStatuses(
    expectedWords: string[],
    actualTranscript: string,
    languageCode: string,
  ): Promise<WordEvaluationStatus[]>;
}
