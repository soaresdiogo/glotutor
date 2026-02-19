import type { LevelProgressEntity } from '@/features/level-progress/domain/entities/level-progress.entity';
import type { ILevelProgressProvider } from '@/features/level-progress/domain/ports/level-progress-provider.interface';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetLevelProgressUseCase {
  execute(userId: string, language: string): Promise<LevelProgressEntity>;
}

export class GetLevelProgressUseCase implements IGetLevelProgressUseCase {
  constructor(
    private readonly progressProvider: ILevelProgressProvider,
    private readonly userLanguageProgressRepo: IUserLanguageProgressRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
  ): Promise<LevelProgressEntity> {
    const ulp = await this.userLanguageProgressRepo.findByUserAndLanguage(
      userId,
      language,
    );
    if (!ulp) {
      throw new NotFoundError(
        'Language not added for this user.',
        'levelProgress.languageNotAdded',
      );
    }

    return this.progressProvider.getLevelProgress(
      userId,
      language,
      ulp.currentLevel,
    );
  }
}
