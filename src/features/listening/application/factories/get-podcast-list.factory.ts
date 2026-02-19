import type { IGetPodcastListUseCase } from '@/features/listening/application/use-cases/get-podcast-list.use-case';
import { GetPodcastListUseCase } from '@/features/listening/application/use-cases/get-podcast-list.use-case';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';
import { StudentListeningProfileProvider } from '@/features/listening/infrastructure/services/student-listening-profile.provider';

import { db } from '@/infrastructure/db/client';

export function makeGetPodcastListUseCase(): IGetPodcastListUseCase {
  return new GetPodcastListUseCase(
    new PodcastRepository(db),
    new StudentListeningProfileProvider(),
  );
}
