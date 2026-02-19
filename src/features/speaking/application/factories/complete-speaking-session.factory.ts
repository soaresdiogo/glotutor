import type { ICompleteSpeakingSessionUseCase } from '@/features/speaking/application/use-cases/complete-speaking-session.use-case';
import { CompleteSpeakingSessionUseCase } from '@/features/speaking/application/use-cases/complete-speaking-session.use-case';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';
import { SpeakingSessionUsageRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session-usage.repository';
import { InMemorySpeakingSessionUsageStore } from '@/features/speaking/infrastructure/stores/in-memory-speaking-session-usage.store';
import { RedisSpeakingSessionUsageStore } from '@/features/speaking/infrastructure/stores/redis-speaking-session-usage.store';
import { ResilientSpeakingSessionUsageStore } from '@/features/speaking/infrastructure/stores/resilient-speaking-session-usage.store';

import { db } from '@/infrastructure/db/client';

export function makeCompleteSpeakingSessionUseCase(): ICompleteSpeakingSessionUseCase {
  const usageStore = new ResilientSpeakingSessionUsageStore(
    new RedisSpeakingSessionUsageStore(),
    new InMemorySpeakingSessionUsageStore(),
  );
  const usageRepo = new SpeakingSessionUsageRepository(db);
  return new CompleteSpeakingSessionUseCase(
    new SpeakingSessionRepository(db),
    usageStore,
    usageRepo,
  );
}
