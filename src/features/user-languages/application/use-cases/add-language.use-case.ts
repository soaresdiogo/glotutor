import type { IContentTotalsProvider } from '@/features/level-progress/domain/ports/content-totals-provider.interface';
import type { ILevelProgressRepository } from '@/features/level-progress/domain/repositories/level-progress.repository.interface';
import { CEFR_LEVEL_ORDER } from '@/features/placement-test/domain/constants/cefr-levels';
import type { IPlacementAttemptRepository } from '@/features/placement-test/domain/repositories/placement-attempt.repository.interface';
import type { UserLanguageProgressEntity } from '@/features/user-languages/domain/entities/user-language-progress.entity';
import type { IUserLanguagePreferencesRepository } from '@/features/user-languages/domain/repositories/user-language-preferences.repository.interface';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import type { IUserLanguageStreakRepository } from '@/features/user-languages/domain/repositories/user-language-streak.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'it', 'fr', 'de'] as const;

export interface IAddLanguageUseCase {
  execute(
    userId: string,
    input: {
      language: string;
      placementAttemptId?: string;
      selectedLevel?: string;
    },
  ): Promise<UserLanguageProgressEntity>;
}

export class AddLanguageUseCase implements IAddLanguageUseCase {
  constructor(
    private readonly progressRepo: IUserLanguageProgressRepository,
    private readonly preferencesRepo: IUserLanguagePreferencesRepository,
    private readonly streakRepo: IUserLanguageStreakRepository,
    private readonly placementAttemptRepo: IPlacementAttemptRepository,
    private readonly levelProgressRepo: ILevelProgressRepository,
    private readonly contentTotals: IContentTotalsProvider,
  ) {}

  async execute(
    userId: string,
    input: {
      language: string;
      placementAttemptId?: string;
      selectedLevel?: string;
    },
  ): Promise<UserLanguageProgressEntity> {
    const lang = input.language.toLowerCase();
    if (
      !SUPPORTED_LANGUAGES.includes(
        lang as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      throw new BadRequestError(
        'Unsupported language.',
        'userLanguages.unsupportedLanguage',
      );
    }

    const existing = await this.progressRepo.findByUserAndLanguage(
      userId,
      lang,
    );
    if (existing) {
      return existing;
    }

    let level = (input.selectedLevel ?? CEFR_LEVEL_ORDER[0]).toUpperCase();
    let placementTestId: string | null = null;

    if (input.placementAttemptId) {
      const attempt = await this.placementAttemptRepo.findById(
        input.placementAttemptId,
      );
      if (!attempt || attempt.userId !== userId) {
        throw new NotFoundError(
          'Placement attempt not found.',
          'placementTest.attemptNotFound',
        );
      }
      if (attempt.language !== lang) {
        throw new BadRequestError(
          'Placement attempt language does not match.',
          'userLanguages.placementMismatch',
        );
      }
      placementTestId = attempt.id;
      level = (
        attempt.selectedLevel ??
        attempt.recommendedLevel ??
        level
      ).toUpperCase();
    }

    const progress = await this.progressRepo.create({
      userId,
      language: lang,
      currentLevel: level,
      placementTestId,
    });

    await this.streakRepo.upsert({
      userId,
      language: lang,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActivityAt: null,
    });

    const totals = await this.contentTotals.getTotals(lang, level);
    await this.levelProgressRepo.create({
      userId,
      language: lang,
      cefrLevel: level,
      lessonsTotal: totals.lessonsTotal,
      podcastsTotal: totals.podcastsTotal,
      readingsTotal: totals.readingsTotal,
      conversationsTotal: totals.conversationsTotal,
    });

    const prefs = await this.preferencesRepo.findById(userId);
    if (!prefs) {
      await this.preferencesRepo.upsert(userId, lang);
    }

    return progress;
  }
}
