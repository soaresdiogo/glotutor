import type { SpeakingTopicDetailEntity } from '@/features/speaking/domain/entities/speaking-topic.entity';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import type { IStudentProfileProvider } from '@/features/student-profile/domain/ports/student-profile-provider.interface';
import type { IGetUserLanguagesUseCase } from '@/features/user-languages/application/use-cases/get-user-languages.use-case';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetSpeakingTopicUseCase {
  execute(userId: string, slug: string): Promise<SpeakingTopicDetailEntity>;
}

/** Resolve content language: primary learning language (course) from user_languages, else profile (e.g. UI language may be PT but course is EN). */
async function resolveContentLanguage(
  userId: string,
  profile: { languageCode: string },
  getUserLanguages: IGetUserLanguagesUseCase,
): Promise<string> {
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
  ): Promise<SpeakingTopicDetailEntity> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bff0321-f76f-4652-8eaa-085556b0ca30', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'get-speaking-topic.use-case.ts:execute:entry',
        message: 'Get topic by slug',
        data: { userId, slug },
        hypothesisId: 'H1',
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
    );
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bff0321-f76f-4652-8eaa-085556b0ca30', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'get-speaking-topic.use-case.ts:execute:profile',
        message: 'Profile language for findBySlug',
        data: { slug, languageCode },
        hypothesisId: 'H1',
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    let topic = await this.topicRepo.findBySlug(slug, languageCode);
    if (!topic && languageCode !== 'en') {
      topic = await this.topicRepo.findBySlug(slug, 'en');
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bff0321-f76f-4652-8eaa-085556b0ca30', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'get-speaking-topic.use-case.ts:execute:result',
        message: 'findBySlug result',
        data: {
          slug,
          languageCode,
          topicFound: !!topic,
          topicLanguageId: topic?.languageId,
        },
        hypothesisId: 'H1',
        runId: 'post-fix',
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (!topic) {
      throw new NotFoundError(
        'Speaking topic not found.',
        'speaking.topicNotFound',
      );
    }
    return topic;
  }
}
