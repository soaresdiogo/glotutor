export type SpeakingExerciseAttemptEntity = {
  id: string;
  sessionId: string;
  exerciseId: string;
  userId: string;
  answer: string | string[] | Record<string, string> | null;
  isCorrect: boolean;
  createdAt: Date;
};
