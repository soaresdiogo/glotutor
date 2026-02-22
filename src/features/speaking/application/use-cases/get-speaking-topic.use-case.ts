import type { SpeakingTopicDetailEntity } from '@/features/speaking/domain/entities/speaking-topic.entity';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import type { IStudentProfileProvider } from '@/features/student-profile/domain/ports/student-profile-provider.interface';
import type { IGetUserLanguagesUseCase } from '@/features/user-languages/application/use-cases/get-user-languages.use-case';
import { NotFoundError } from '@/shared/lib/errors';

export type GetSpeakingTopicParams = { language?: string };

export interface IGetSpeakingTopicUseCase {
  execute(
    userId: string,
    slug: string,
    params?: GetSpeakingTopicParams,
  ): Promise<SpeakingTopicDetailEntity>;
}

/** Resolve content language: explicit param > primary from user_languages > profile. */
async function resolveContentLanguage(
  userId: string,
  profile: { languageCode: string },
  getUserLanguages: IGetUserLanguagesUseCase,
  explicitLanguage?: string,
): Promise<string> {
  if (explicitLanguage?.trim()) return explicitLanguage.trim();
  const summaries = await getUserLanguages.execute(userId);
  const primary = summaries.find((s) => s.isPrimary) ?? summaries[0];
  return primary?.language ?? profile.languageCode;
}

export class GetSpeakingTopicUseCase implements IGetSpeakingTopicUseCase {
  constructor(
    private readonly topicRepo: ISpeakingTopicRepository,
    private readonly profileProvider: IStudentProfileProvider,
    private readonly getUserLanguages: IGetUserLanguagesUseCase,
  ) {}

  async execute(
    userId: string,
    slug: string,
    params?: GetSpeakingTopicParams,
  ): Promise<SpeakingTopicDetailEntity> {
    const profile = await this.profileProvider.getProfile(userId);
    if (!profile) {
      throw new NotFoundError(
        'Student profile not found.',
        'speaking.profileNotFound',
      );
    }
    const languageCode = await resolveContentLanguage(
      userId,
      profile,
      this.getUserLanguages,
      params?.language,
    );
    let topic = await this.topicRepo.findBySlug(slug, languageCode);
    if (!topic && languageCode !== 'en') {
      topic = await this.topicRepo.findBySlug(slug, 'en');
    }
    if (!topic) {
      throw new NotFoundError(
        'Speaking topic not found.',
        'speaking.topicNotFound',
      );
    }
    return topic;
  }
}
