import type { IGetSpeakingTopicUseCase } from '@/features/speaking/application/use-cases/get-speaking-topic.use-case';
import { GetSpeakingTopicUseCase } from '@/features/speaking/application/use-cases/get-speaking-topic.use-case';
import { SpeakingTopicRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-topic.repository';
import { StudentProfileProvider } from '@/features/student-profile/infrastructure/student-profile.provider';
import { makeGetUserLanguagesUseCase } from '@/features/user-languages/application/factories/get-user-languages.factory';

import { db } from '@/infrastructure/db/client';

export function makeGetSpeakingTopicUseCase(): IGetSpeakingTopicUseCase {
  return new GetSpeakingTopicUseCase(
    new SpeakingTopicRepository(db),
    new StudentProfileProvider(),
    makeGetUserLanguagesUseCase(),
  );
}
