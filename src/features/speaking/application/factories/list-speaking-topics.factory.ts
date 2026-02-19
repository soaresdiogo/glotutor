import type { IListSpeakingTopicsUseCase } from '@/features/speaking/application/use-cases/list-speaking-topics.use-case';
import { ListSpeakingTopicsUseCase } from '@/features/speaking/application/use-cases/list-speaking-topics.use-case';
import { SpeakingTopicRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-topic.repository';
import { StudentProfileProvider } from '@/features/student-profile/infrastructure/student-profile.provider';
import { makeGetUserLanguagesUseCase } from '@/features/user-languages/application/factories/get-user-languages.factory';

import { db } from '@/infrastructure/db/client';

export function makeListSpeakingTopicsUseCase(): IListSpeakingTopicsUseCase {
  return new ListSpeakingTopicsUseCase(
    new SpeakingTopicRepository(db),
    new StudentProfileProvider(),
    makeGetUserLanguagesUseCase(),
  );
}
