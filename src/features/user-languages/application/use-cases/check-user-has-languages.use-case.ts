import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';

export interface ICheckUserHasLanguagesUseCase {
  execute(userId: string): Promise<boolean>;
}

export class CheckUserHasLanguagesUseCase
  implements ICheckUserHasLanguagesUseCase
{
  constructor(private readonly progressRepo: IUserLanguageProgressRepository) {}

  async execute(userId: string): Promise<boolean> {
    return this.progressRepo.hasAnyByUserId(userId);
  }
}
