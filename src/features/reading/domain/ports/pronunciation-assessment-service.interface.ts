/**
 * Result of a pronunciation assessment (e.g. Azure Speech).
 * Domain-level type; infrastructure maps provider-specific results to this shape.
 */
export type PronunciationAssessmentWord = {
  word: string;
  accuracyScore: number;
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
  offset: number;
  duration: number;
};

export type PronunciationAssessmentResult = {
  words: PronunciationAssessmentWord[];
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  durationSeconds: number;
};

/**
 * Service that can assess pronunciation from audio using a reference text.
 * Implemented by Azure Speech (and optionally others); use case depends on this abstraction.
 */
export interface IPronunciationAssessmentService {
  assessPronunciation(
    audioBuffer: Buffer,
    mimeType: string,
    referenceText: string,
    languageCode: string,
  ): Promise<PronunciationAssessmentResult>;
}
