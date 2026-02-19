import type { StudentPodcastProgressEntity } from '@/features/listening/domain/entities/student-podcast-progress.entity';
import type { IPodcastRepository } from '@/features/listening/domain/repositories/podcast-repository.interface';
import type { IStudentPodcastProgressRepository } from '@/features/listening/domain/repositories/student-podcast-progress-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IUpdateListeningProgressUseCase {
  execute(
    userId: string,
    podcastId: string,
    listenedPercentage: number,
  ): Promise<StudentPodcastProgressEntity>;
}

export class UpdateListeningProgressUseCase
  implements IUpdateListeningProgressUseCase
{
  constructor(
    private readonly podcastRepo: IPodcastRepository,
    private readonly progressRepo: IStudentPodcastProgressRepository,
  ) {}

  async execute(
    userId: string,
    podcastId: string,
    listenedPercentage: number,
  ): Promise<StudentPodcastProgressEntity> {
    const podcast = await this.podcastRepo.findById(podcastId);
    if (!podcast) {
      throw new NotFoundError(
        'Podcast not found.',
        'listening.api.podcastNotFound',
      );
    }
    const clamped = Math.min(100, Math.max(0, Math.round(listenedPercentage)));
    return this.progressRepo.upsertProgress(userId, podcastId, clamped);
  }
}
