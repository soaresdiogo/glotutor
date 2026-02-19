import type { StudentPodcastProgressEntity } from '../entities/student-podcast-progress.entity';

export interface IStudentPodcastProgressRepository {
  findByUserAndPodcast(
    userId: string,
    podcastId: string,
  ): Promise<StudentPodcastProgressEntity | null>;

  upsertProgress(
    userId: string,
    podcastId: string,
    listenedPercentage: number,
  ): Promise<StudentPodcastProgressEntity>;

  updateExerciseResults(
    userId: string,
    podcastId: string,
    data: {
      exerciseScore: number;
      totalQuestions: number;
      exerciseAnswers: Array<{ questionNumber: number; answer: string }>;
      exerciseFeedback: StudentPodcastProgressEntity['exerciseFeedback'];
    },
  ): Promise<StudentPodcastProgressEntity | null>;
}
