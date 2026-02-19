import { eq } from 'drizzle-orm';

import type {
  IStudentProfileProvider,
  StudentProfile,
} from '@/features/student-profile/domain/ports/student-profile-provider.interface';
import { db } from '@/infrastructure/db/client';
import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';

export class StudentProfileProvider implements IStudentProfileProvider {
  async getProfile(userId: string): Promise<StudentProfile | null> {
    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: {
        targetLanguageId: true,
        currentLevel: true,
        nativeLanguageCode: true,
      },
    });
    if (!profile) return null;
    const lang = await db.query.supportedLanguages.findFirst({
      where: eq(supportedLanguages.id, profile.targetLanguageId),
      columns: { code: true },
    });
    return {
      languageCode: lang?.code ?? 'en',
      cefrLevel: profile.currentLevel,
      nativeLanguageCode: profile.nativeLanguageCode ?? 'en',
    };
  }
}
