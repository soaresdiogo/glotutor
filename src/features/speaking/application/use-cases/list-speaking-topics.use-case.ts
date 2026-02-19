import { CEFR_LEVEL_ORDER } from '@/features/placement-test/domain/constants/cefr-levels';
import type { SpeakingTopicListItemEntity } from '@/features/speaking/domain/entities/speaking-topic.entity';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import type { IStudentProfileProvider } from '@/features/student-profile/domain/ports/student-profile-provider.interface';
import type { IGetUserLanguagesUseCase } from '@/features/user-languages/application/use-cases/get-user-languages.use-case';
import { NotFoundError } from '@/shared/lib/errors';

import type { ListSpeakingTopicsDto } from '../dto/list-speaking-topics.dto';

/** CEFR levels at or below the given level (e.g. A2 → [A1, A2]), case-insensitive. */
function levelsAtOrBelow(userLevel: string): string[] {
  const normalized = userLevel.trim().toUpperCase();
  const idx = CEFR_LEVEL_ORDER.indexOf(
    normalized as (typeof CEFR_LEVEL_ORDER)[number],
  );
  if (idx < 0) return [normalized];
  return CEFR_LEVEL_ORDER.slice(0, idx + 1);
}

/** Content language and level from primary learning language (course) when available, else profile. */
async function resolveContentLanguageAndLevel(
  userId: string,
  dto: ListSpeakingTopicsDto,
  profile: { languageCode: string; cefrLevel: string },
  getUserLanguages: IGetUserLanguagesUseCase,
): Promise<{ languageCode: string; cefrLevel: string }> {
  const summaries = await getUserLanguages.execute(userId);
  const primary = summaries.find((s) => s.isPrimary) ?? summaries[0];
  return {
    languageCode: dto.language ?? primary?.language ?? profile.languageCode,
    cefrLevel: dto.level ?? primary?.currentLevel ?? profile.cefrLevel,
  };
}

export interface IListSpeakingTopicsUseCase {
  execute(
    userId: string,
    dto: ListSpeakingTopicsDto,
  ): Promise<SpeakingTopicListItemEntity[]>;
}

export class ListSpeakingTopicsUseCase implements IListSpeakingTopicsUseCase {
  constructor(
    private readonly topicRepo: ISpeakingTopicRepository,
    private readonly profileProvider: IStudentProfileProvider,
    private readonly getUserLanguages: IGetUserLanguagesUseCase,
  ) {}

  async execute(
    userId: string,
    dto: ListSpeakingTopicsDto,
  ): Promise<SpeakingTopicListItemEntity[]> {
    const profile = await this.profileProvider.getProfile(userId);
    if (!profile) {
      throw new NotFoundError(
        'Student profile not found.',
        'speaking.profileNotFound',
      );
    }
    const { languageCode, cefrLevel } = await resolveContentLanguageAndLevel(
      userId,
      dto,
      profile,
      this.getUserLanguages,
    );
    const levels = levelsAtOrBelow(cefrLevel);
    let topics = await this.topicRepo.findManyByLanguageAndLevel(
      languageCode,
      levels,
    );
    if (topics.length === 0 && languageCode !== 'en') {
      topics = await this.topicRepo.findManyByLanguageAndLevel('en', levels);
    }
    return topics;
  }
}
