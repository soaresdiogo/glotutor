export type SpeakingExerciseType =
  | 'fill_blank'
  | 'multiple_choice'
  | 'reorder_sentence'
  | 'match_expression';

export type SpeakingExerciseEntity = {
  id: string;
  topicId: string;
  questionNumber: number;
  type: SpeakingExerciseType;
  questionText: string;
  options: string[] | Record<string, string>[] | null;
  correctAnswer: string;
  explanationText: string;
};
