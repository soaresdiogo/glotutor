import type { IGetPodcastDetailUseCase } from '@/features/listening/application/use-cases/get-podcast-detail.use-case';
import { GetPodcastDetailUseCase } from '@/features/listening/application/use-cases/get-podcast-detail.use-case';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';

import { db } from '@/infrastructure/db/client';

export function makeGetPodcastDetailUseCase(): IGetPodcastDetailUseCase {
  return new GetPodcastDetailUseCase(new PodcastRepository(db));
}
