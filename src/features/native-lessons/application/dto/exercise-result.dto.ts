export type ExerciseResultDTO = {
  exerciseIndex: number;
  type: string;
  correct: boolean;
  score?: number;
  userAnswer?: string | string[];
  correctAnswer?: string | string[];
  feedback?: string;
  natural?: boolean;
  betterVersion?: string;
  keyPhrasesUsed?: string[];
  missingOpportunities?: string[];
};
