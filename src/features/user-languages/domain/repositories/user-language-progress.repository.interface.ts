import type { UserLanguageProgressEntity } from '../entities/user-language-progress.entity';

export interface IUserLanguageProgressRepository {
  create(data: {
    userId: string;
    language: string;
    currentLevel: string;
    placementTestId?: string | null;
  }): Promise<UserLanguageProgressEntity>;

  findByUserAndLanguage(
    userId: string,
    language: string,
  ): Promise<UserLanguageProgressEntity | null>;

  findByUserId(userId: string): Promise<UserLanguageProgressEntity[]>;

  updateLevel(
    id: string,
    currentLevel: string,
  ): Promise<UserLanguageProgressEntity>;

  hasAnyByUserId(userId: string): Promise<boolean>;
}
