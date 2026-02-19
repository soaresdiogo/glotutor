import type { ILevelProgressProvider } from '@/features/level-progress/domain/ports/level-progress-provider.interface';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface ICheckCertificationEligibilityUseCase {
  execute(
    userId: string,
    language: string,
  ): Promise<{ eligible: boolean; completionPercentage: number }>;
}

export class CheckCertificationEligibilityUseCase
  implements ICheckCertificationEligibilityUseCase
{
  constructor(
    private readonly progressProvider: ILevelProgressProvider,
    private readonly userLanguageProgressRepo: IUserLanguageProgressRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
  ): Promise<{ eligible: boolean; completionPercentage: number }> {
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

    const progress = await this.progressProvider.getLevelProgress(
      userId,
      language,
      ulp.currentLevel,
    );

    return {
      eligible: progress.certificationUnlocked,
      completionPercentage: progress.completionPercentage,
    };
  }
}
