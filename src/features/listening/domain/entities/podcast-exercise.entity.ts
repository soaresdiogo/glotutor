export type PodcastExerciseType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'sentence_order'
  | 'open_ended';

export type PodcastExerciseEntity = {
  id: string;
  podcastId: string;
  questionNumber: number;
  type: PodcastExerciseType;
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  explanationText: string;
};
