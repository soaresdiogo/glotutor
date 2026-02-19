import type { PodcastEntity } from '../entities/podcast.entity';
import type { PodcastExerciseEntity } from '../entities/podcast-exercise.entity';
import type { StudentPodcastProgressEntity } from '../entities/student-podcast-progress.entity';

export type PodcastListItemEntity = Pick<
  PodcastEntity,
  | 'id'
  | 'title'
  | 'description'
  | 'languageCode'
  | 'cefrLevel'
  | 'durationSeconds'
  | 'createdAt'
> & {
  exerciseCount: number;
  progress?: {
    listenedPercentage: number;
    exerciseScore: number | null;
    totalQuestions?: number | null;
    exerciseCompletedAt: Date | null;
  };
};

export type PodcastDetailEntity = PodcastEntity & {
  exercises: PodcastExerciseEntity[];
  progress?: {
    listenedPercentage: number;
    exerciseScore: number | null;
    totalQuestions: number | null;
    exerciseCompletedAt: Date | null;
    exerciseAnswers: Array<{ questionNumber: number; answer: string }> | null;
    exerciseFeedback: StudentPodcastProgressEntity['exerciseFeedback'];
  };
};

export interface IPodcastRepository {
  findLanguageIdByCode(languageCode: string): Promise<string | null>;

  findManyByLanguageAndLevel(
    languageCode: string,
    cefrLevel: string,
    userId: string,
  ): Promise<PodcastListItemEntity[]>;

  findDetailById(
    podcastId: string,
    userId: string,
  ): Promise<PodcastDetailEntity | null>;

  findById(podcastId: string): Promise<PodcastEntity | null>;

  create(podcast: {
    languageId: string;
    title: string;
    description: string;
    cefrLevel: string;
    audioUrl: string;
    transcript: string;
    durationSeconds: number;
    vocabularyHighlights: Array<{ word: string; translation: string }>;
  }): Promise<PodcastEntity>;

  createExercises(
    podcastId: string,
    exercises: Array<{
      questionNumber: number;
      type: string;
      questionText: string;
      options: string[] | null;
      correctAnswer: string;
      explanationText: string;
    }>,
  ): Promise<PodcastExerciseEntity[]>;
}
