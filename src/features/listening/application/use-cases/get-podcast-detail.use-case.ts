import type {
  IPodcastRepository,
  PodcastDetailEntity,
} from '@/features/listening/domain/repositories/podcast-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetPodcastDetailUseCase {
  execute(userId: string, podcastId: string): Promise<PodcastDetailEntity>;
}

export class GetPodcastDetailUseCase implements IGetPodcastDetailUseCase {
  constructor(private readonly podcastRepo: IPodcastRepository) {}

  async execute(
    userId: string,
    podcastId: string,
  ): Promise<PodcastDetailEntity> {
    const detail = await this.podcastRepo.findDetailById(podcastId, userId);
    if (!detail) {
      throw new NotFoundError(
        'Podcast not found.',
        'listening.api.podcastNotFound',
      );
    }
    return detail;
  }
}
