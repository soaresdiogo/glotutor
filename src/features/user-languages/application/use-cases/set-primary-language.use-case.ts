import type { IUserLanguagePreferencesRepository } from '@/features/user-languages/domain/repositories/user-language-preferences.repository.interface';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';

export interface ISetPrimaryLanguageUseCase {
  execute(
    userId: string,
    language: string,
  ): Promise<{ primaryLanguage: string }>;
}

export class SetPrimaryLanguageUseCase implements ISetPrimaryLanguageUseCase {
  constructor(
    private readonly progressRepo: IUserLanguageProgressRepository,
    private readonly preferencesRepo: IUserLanguagePreferencesRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
  ): Promise<{ primaryLanguage: string }> {
    const lang = language.toLowerCase();
    const progress = await this.progressRepo.findByUserAndLanguage(
      userId,
      lang,
    );
    if (!progress) {
      throw new BadRequestError(
        'Language not added for this user.',
        'userLanguages.languageNotAdded',
      );
    }

    const prefs = await this.preferencesRepo.upsert(userId, lang);
    return { primaryLanguage: prefs.primaryLanguage };
  }
}
