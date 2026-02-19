import type { UserLanguagePreferencesEntity } from '../entities/user-language-preferences.entity';

export interface IUserLanguagePreferencesRepository {
  findById(userId: string): Promise<UserLanguagePreferencesEntity | null>;

  upsert(
    userId: string,
    primaryLanguage: string,
  ): Promise<UserLanguagePreferencesEntity>;
}
