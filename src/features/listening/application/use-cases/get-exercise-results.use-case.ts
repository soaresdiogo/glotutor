import type {
  IPodcastRepository,
  PodcastDetailEntity,
} from '@/features/listening/domain/repositories/podcast-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export type ExerciseResultsOutput = {
  podcastId: string;
  podcastTitle: string;
  exerciseScore: number;
  totalQuestions: number;
  exerciseCompletedAt: Date;
  exerciseFeedback: NonNullable<
    PodcastDetailEntity['progress']
  >['exerciseFeedback'];
};

export interface IGetExerciseResultsUseCase {
  execute(userId: string, podcastId: string): Promise<ExerciseResultsOutput>;
}

export class GetExerciseResultsUseCase implements IGetExerciseResultsUseCase {
  constructor(private readonly podcastRepo: IPodcastRepository) {}

  async execute(
    userId: string,
    podcastId: string,
  ): Promise<ExerciseResultsOutput> {
    const detail = await this.podcastRepo.findDetailById(podcastId, userId);
    if (!detail) {
      throw new NotFoundError(
        'Podcast not found.',
        'listening.api.podcastNotFound',
      );
    }
    const progress = detail.progress;
    if (
      !progress?.exerciseCompletedAt ||
      progress.exerciseScore == null ||
      !progress.exerciseFeedback
    ) {
      throw new NotFoundError(
        'Exercise results not found.',
        'listening.api.resultsNotFound',
      );
    }
    const totalQuestions =
      progress.totalQuestions ??
      ((progress.exerciseFeedback?.perQuestion?.length ?? 0) || 1);
    return {
      podcastId: detail.id,
      podcastTitle: detail.title,
      exerciseScore: progress.exerciseScore,
      totalQuestions,
      exerciseCompletedAt: progress.exerciseCompletedAt,
      exerciseFeedback: progress.exerciseFeedback,
    };
  }
}
