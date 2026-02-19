import { eq } from 'drizzle-orm';

import type {
  IStudentProfileRepository,
  StudentProfileForReadingEntity,
} from '@/features/reading/domain/repositories/student-profile-repository.interface';

import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import type { DbClient } from '@/infrastructure/db/types';

export class StudentProfileRepository implements IStudentProfileRepository {
  constructor(private readonly dbClient: DbClient) {}

  async findForReadingByUserId(
    userId: string,
  ): Promise<StudentProfileForReadingEntity | null> {
    const row = await this.dbClient.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: { currentLevel: true, nativeLanguageCode: true },
    });
    if (!row) return null;
    return {
      currentLevel: row.currentLevel,
      nativeLanguageCode: row.nativeLanguageCode,
    };
  }
}
