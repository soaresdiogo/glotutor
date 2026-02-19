import type { IUpdateListeningProgressUseCase } from '@/features/listening/application/use-cases/update-listening-progress.use-case';
import { UpdateListeningProgressUseCase } from '@/features/listening/application/use-cases/update-listening-progress.use-case';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';
import { StudentPodcastProgressRepository } from '@/features/listening/infrastructure/drizzle-repositories/student-podcast-progress.repository';

import { db } from '@/infrastructure/db/client';

export function makeUpdateListeningProgressUseCase(): IUpdateListeningProgressUseCase {
  return new UpdateListeningProgressUseCase(
    new PodcastRepository(db),
    new StudentPodcastProgressRepository(db),
  );
}
