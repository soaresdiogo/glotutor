export type LessonCompletionExerciseResult = {
  exerciseIndex: number;
  type: string;
  correct: boolean;
  score?: number;
  userAnswer?: string | string[];
  correctAnswer?: string | string[];
  feedback?: string;
};

export type LessonCompletionDTO = {
  lessonId: string;
  results: LessonCompletionExerciseResult[];
};
