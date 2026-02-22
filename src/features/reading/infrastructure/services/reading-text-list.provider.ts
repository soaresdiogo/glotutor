import { eq } from 'drizzle-orm';

import type {
  GetTextsForUserParams,
  GetTextsForUserResult,
  IReadingTextListProvider,
  ReadingTextListItemEntity,
} from '@/features/reading/domain/ports/reading-text-list-provider.interface';
import { ensureStudentProfile } from '@/features/student-profile/infrastructure/ensure-student-profile';
import { db } from '@/infrastructure/db/client';
import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import { redisGet, redisSet } from '@/shared/lib/reading/redis-client';

const TEXT_LIST_COLUMNS = {
  id: true,
  title: true,
  content: true,
  category: true,
  level: true,
  cefrLevel: true,
  wordCount: true,
  estimatedMinutes: true,
  languageId: true,
} as const;

const TEXT_LIST_WITH = { language: { columns: { code: true } } } as const;

type TextRow = Awaited<
  ReturnType<
    typeof db.query.texts.findMany<{
      columns: typeof TEXT_LIST_COLUMNS;
      with: typeof TEXT_LIST_WITH;
    }>
  >
>[number];

async function fetchTexts(
  languageIds: string[],
  level: string,
  withLevel: boolean,
): Promise<TextRow[]> {
  return db.query.texts.findMany({
    where: (table, { and, eq, inArray }) =>
      withLevel
        ? and(
            inArray(table.languageId, languageIds),
            eq(table.level, level),
            eq(table.isPublished, true),
          )
        : and(
            inArray(table.languageId, languageIds),
            eq(table.isPublished, true),
          ),
    columns: TEXT_LIST_COLUMNS,
    with: TEXT_LIST_WITH,
  });
}

async function fetchRowsForMatchingLanguages(
  matchingLanguageIds: string[],
  level: string,
): Promise<TextRow[]> {
  const withLevel = await fetchTexts(matchingLanguageIds, level, true);
  if (withLevel.length > 0) return withLevel;
  return fetchTexts(matchingLanguageIds, level, false);
}

async function fetchEnglishFallbackRows(
  allLanguages: { id: string; code: string }[],
  level: string,
): Promise<TextRow[]> {
  const enLanguageIds = allLanguages
    .filter((l) => l.code.startsWith('en'))
    .map((l) => l.id);
  if (enLanguageIds.length === 0) return [];
  const withLevel = await fetchTexts(enLanguageIds, level, true);
  if (withLevel.length > 0) return withLevel;
  return fetchTexts(enLanguageIds, level, false);
}

function mapRowsToEntities(rows: TextRow[]): ReadingTextListItemEntity[] {
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    category: r.category,
    level: r.level,
    cefrLevel: r.cefrLevel,
    wordCount: r.wordCount,
    estimatedMinutes: r.estimatedMinutes,
    languageCode: r.language?.code ?? 'en',
  }));
}

type CodePrefixAndLevel =
  | { codePrefix: string; level: string }
  | { empty: true };

async function resolveCodePrefixAndLevel(
  userId: string,
  params: GetTextsForUserParams | undefined,
  profile:
    | { targetLanguageId: string | null; currentLevel: string | null }
    | undefined,
): Promise<CodePrefixAndLevel> {
  if (params?.languageCode) {
    return {
      codePrefix: params.languageCode.split('-')[0],
      level: params?.level ?? profile?.currentLevel ?? 'A1',
    };
  }
  let targetLanguageId = profile?.targetLanguageId ?? null;
  let level = params?.level ?? profile?.currentLevel ?? 'A1';
  if (!targetLanguageId) {
    await ensureStudentProfile(userId);
    const profileAfter = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: { targetLanguageId: true, currentLevel: true },
    });
    if (!profileAfter?.targetLanguageId) return { empty: true };
    targetLanguageId = profileAfter.targetLanguageId;
    level = params?.level ?? profileAfter.currentLevel ?? 'A1';
  }
  const targetLanguage = await db.query.supportedLanguages.findFirst({
    where: (table, { eq }) => eq(table.id, targetLanguageId),
    columns: { id: true, code: true },
  });
  if (!targetLanguage) return { empty: true };
  return { codePrefix: targetLanguage.code.split('-')[0], level };
}

export class ReadingTextListProvider implements IReadingTextListProvider {
  async getTextsForUser(
    userId: string,
    params?: GetTextsForUserParams,
  ): Promise<GetTextsForUserResult> {
    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: { targetLanguageId: true, currentLevel: true },
    });

    const resolved = await resolveCodePrefixAndLevel(userId, params, profile);
    if ('empty' in resolved) return { kind: 'fresh', texts: [] };
    const { codePrefix, level } = resolved;

    const allLanguages = await db.query.supportedLanguages.findMany({
      columns: { id: true, code: true },
    });

    const matchingLanguageIds = allLanguages
      .filter((l) => l.code.startsWith(codePrefix))
      .map((l) => l.id);

    if (matchingLanguageIds.length === 0) return { kind: 'fresh', texts: [] };

    const cacheKey = `reading:texts:${codePrefix}:${level}`;
    const cached = await redisGet(cacheKey);
    if (cached) return { kind: 'cached', body: cached };

    let rows = await fetchRowsForMatchingLanguages(matchingLanguageIds, level);
    if (rows.length === 0 && codePrefix !== 'en') {
      rows = await fetchEnglishFallbackRows(allLanguages, level);
    }

    const textsList = mapRowsToEntities(rows);
    if (textsList.length > 0) {
      await redisSet(cacheKey, JSON.stringify({ texts: textsList }), 3600);
    }
    return { kind: 'fresh', texts: textsList };
  }
}
