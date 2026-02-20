import { eq } from 'drizzle-orm';

import type {
  GetTextsForUserResult,
  IReadingTextListProvider,
  ReadingTextListItemEntity,
} from '@/features/reading/domain/ports/reading-text-list-provider.interface';
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

export class ReadingTextListProvider implements IReadingTextListProvider {
  async getTextsForUser(userId: string): Promise<GetTextsForUserResult> {
    console.log('\n========================================');
    console.log('🔍 DEBUG: getTextsForUser START');
    console.log('📝 userId:', userId);

    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: { targetLanguageId: true, currentLevel: true },
    });
    console.log('👤 profile:', JSON.stringify(profile, null, 2));

    const targetLanguageId = profile?.targetLanguageId ?? null;
    const level = profile?.currentLevel ?? 'A1';
    console.log('🎯 targetLanguageId:', targetLanguageId);
    console.log('📊 level:', level);

    if (!targetLanguageId) {
      console.log('❌ NO TARGET LANGUAGE ID - returning empty');
      console.log('========================================\n');
      return { kind: 'fresh', texts: [] };
    }

    const targetLanguage = await db.query.supportedLanguages.findFirst({
      where: (table, { eq }) => eq(table.id, targetLanguageId),
      columns: { id: true, code: true },
    });
    console.log('🌍 targetLanguage:', JSON.stringify(targetLanguage, null, 2));

    if (!targetLanguage) {
      console.log('❌ TARGET LANGUAGE NOT FOUND - returning empty');
      console.log('========================================\n');
      return { kind: 'fresh', texts: [] };
    }

    const codePrefix = targetLanguage.code.split('-')[0];
    console.log('🔤 codePrefix:', codePrefix);

    const allLanguages = await db.query.supportedLanguages.findMany({
      columns: { id: true, code: true },
    });
    console.log('🌐 allLanguages count:', allLanguages.length);
    console.log('🌐 allLanguages:', JSON.stringify(allLanguages, null, 2));

    const matchingLanguageIds = allLanguages
      .filter((l) => l.code.startsWith(codePrefix))
      .map((l) => l.id);
    console.log('✅ matchingLanguageIds:', matchingLanguageIds);
    console.log('✅ matchingLanguageIds count:', matchingLanguageIds.length);

    if (matchingLanguageIds.length === 0) {
      console.log('❌ NO MATCHING LANGUAGE IDS - returning empty');
      console.log('========================================\n');
      return { kind: 'fresh', texts: [] };
    }

    const cacheKey = `reading:texts:${codePrefix}:${level}`;
    console.log('🗝️  cacheKey:', cacheKey);

    const cached = await redisGet(cacheKey);
    if (cached) {
      console.log('💾 RETURNING FROM CACHE');
      console.log('========================================\n');
      return { kind: 'cached', body: cached };
    }

    console.log('🔍 CACHE MISS - querying database...');
    console.log('📋 Query filters:');
    console.log('   - languageId IN:', matchingLanguageIds);
    console.log('   - level:', level);
    console.log('   - isPublished: true');

    let rows = await fetchRowsForMatchingLanguages(matchingLanguageIds, level);
    console.log('📚 Query result (with/without level):', rows.length, 'rows');
    if (rows.length > 0) {
      console.log('📄 First row:', JSON.stringify(rows[0], null, 2));
    }

    const shouldTryEnglishFallback = rows.length === 0 && codePrefix !== 'en';
    if (shouldTryEnglishFallback) {
      rows = await fetchEnglishFallbackRows(allLanguages, level);
      console.log('📚 English fallback result:', rows.length, 'rows');
      if (rows.length > 0) {
        console.log('📄 First row:', JSON.stringify(rows[0], null, 2));
      }
    }

    if (rows.length === 0) {
      console.log('⚠️  Still no rows, trying ALL published texts...');
      const allTexts = await db.query.texts.findMany({
        where: (table, { eq }) => eq(table.isPublished, true),
        columns: {
          id: true,
          title: true,
          languageId: true,
          level: true,
          isPublished: true,
        },
      });
      console.log('📚 ALL published texts:', allTexts.length);
      if (allTexts.length > 0) {
        console.log('📄 All texts data:', JSON.stringify(allTexts, null, 2));
      }
    }

    const textsList = mapRowsToEntities(rows);
    console.log('📦 Final textsList count:', textsList.length);

    const body = JSON.stringify({ texts: textsList });
    if (textsList.length > 0) {
      console.log('💾 Caching result...');
      await redisSet(cacheKey, body, 3600);
    } else {
      console.log('⚠️  Not caching empty result');
    }

    console.log('✅ RETURNING fresh result with', textsList.length, 'texts');
    console.log('========================================\n');
    return { kind: 'fresh', texts: textsList };
  }
}
