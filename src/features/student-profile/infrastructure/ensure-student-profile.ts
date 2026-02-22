import { and, eq, like, or } from 'drizzle-orm';

import { db } from '@/infrastructure/db/client';
import {
  studentProfiles,
  supportedLanguages,
  userLanguagePreferences,
  userLanguageProgress,
} from '@/infrastructure/db/schema';

const DEFAULT_NATIVE = 'pt-BR';
const DEFAULT_LEVEL = 'A1';

/**
 * Creates a student_profile from the user's primary (or first) learning language
 * when none exists. Used so listing podcasts, speaking topics, and reading texts
 * work for users who have user_languages but no student_profiles row (e.g.
 * added languages before profile was required, or profile was never created).
 */
export async function ensureStudentProfile(userId: string): Promise<boolean> {
  const existing = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId),
    columns: { id: true },
  });
  if (existing) return false;

  const prefs = await db.query.userLanguagePreferences.findFirst({
    where: eq(userLanguagePreferences.userId, userId),
    columns: { primaryLanguage: true },
  });
  const progressList = await db.query.userLanguageProgress.findMany({
    where: and(
      eq(userLanguageProgress.userId, userId),
      eq(userLanguageProgress.isActive, true),
    ),
    columns: { language: true, currentLevel: true },
    orderBy: (t, { asc }) => [asc(t.startedAt)],
  });
  const langCode: string | null =
    prefs?.primaryLanguage ?? progressList[0]?.language ?? null;
  let level =
    progressList.find((p) => p.language === langCode)?.currentLevel ??
    progressList[0]?.currentLevel ??
    DEFAULT_LEVEL;

  let langRow: { id: string } | undefined;
  if (langCode) {
    langRow = await db.query.supportedLanguages.findFirst({
      where: or(
        eq(supportedLanguages.code, langCode),
        like(supportedLanguages.code, `${langCode}-%`),
      ),
      columns: { id: true },
    });
  }
  if (!langRow) {
    const defaultLang = await db.query.supportedLanguages.findFirst({
      where: eq(supportedLanguages.isActive, true),
      columns: { id: true },
      orderBy: (t, { asc }) => [asc(t.code)],
    });
    if (!defaultLang) return false;
    langRow = defaultLang;
    level = DEFAULT_LEVEL;
  }

  await db.insert(studentProfiles).values({
    userId,
    targetLanguageId: langRow.id,
    nativeLanguageCode: DEFAULT_NATIVE,
    currentLevel: level,
  });
  return true;
}
