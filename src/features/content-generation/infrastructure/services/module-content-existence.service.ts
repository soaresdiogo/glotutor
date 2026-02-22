import { and, desc, eq, or, sql } from 'drizzle-orm';
import { nativeLessons } from '@/infrastructure/db/schema/native-lessons';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { speakingTopics } from '@/infrastructure/db/schema/speaking-topics';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import { texts } from '@/infrastructure/db/schema/texts';
import type { DbClient } from '@/infrastructure/db/types';
import { getModuleMetadata } from '../utils/module-list-parser';

export type ExistingPasses = {
  lesson: boolean;
  reading: boolean;
  podcast: boolean;
  speaking: boolean;
};

async function resolveLanguageId(
  db: DbClient,
  targetLanguage: string,
): Promise<string | null> {
  const code = targetLanguage.split('-')[0];
  const row = await db.query.supportedLanguages.findFirst({
    where: eq(supportedLanguages.code, code),
    columns: { id: true },
  });
  return row?.id ?? null;
}

/**
 * Returns which passes already have content in the DB for this module + language + level.
 * Used by the batch script to skip already-generated content or run only missing passes.
 * Matches by module_id (stored in content/structured_content/rich_content) or, for legacy
 * rows without module_id, by title from the module list.
 */
export async function getExistingPasses(
  db: DbClient,
  moduleId: string,
  level: string,
  targetLanguage: string,
): Promise<ExistingPasses> {
  const meta = await getModuleMetadata(moduleId);
  const title = meta?.title ?? moduleId;
  const lang = targetLanguage.split('-')[0];
  const languageId = await resolveLanguageId(db, targetLanguage);
  const levelUpper = level.toUpperCase();

  const result: ExistingPasses = {
    lesson: false,
    reading: false,
    podcast: false,
    speaking: false,
  };

  if (!languageId) return result;

  // Legacy rows have no module_id; match by title case-insensitively (LLM may have generated a variant)
  // or by moduleId (mapper falls back to spec.moduleId when generated title is empty)
  const titleMatchLesson = sql`(lower(trim(${nativeLessons.title})) = lower(trim(${title})) or lower(trim(${nativeLessons.title})) = lower(trim(${moduleId})))`;
  const titleMatchText = sql`(lower(trim(${texts.title})) = lower(trim(${title})) or lower(trim(${texts.title})) = lower(trim(${moduleId})))`;
  const titleMatchPodcast = sql`(lower(trim(${podcasts.title})) = lower(trim(${title})) or lower(trim(${podcasts.title})) = lower(trim(${moduleId})))`;

  // Lesson: native_lessons (language, level) + content->>'module_id' = moduleId OR title match
  const [lessonRow] = await db
    .select({ id: nativeLessons.id })
    .from(nativeLessons)
    .where(
      and(
        eq(nativeLessons.language, lang),
        eq(nativeLessons.level, levelUpper),
        or(
          sql`${nativeLessons.content}->>'module_id' = ${moduleId}`,
          and(
            sql`(${nativeLessons.content}->>'module_id') is null`,
            titleMatchLesson,
          ),
        ),
      ),
    )
    .limit(1);
  result.lesson = !!lessonRow?.id;

  // Reading: texts (languageId, level, generation_type) + structured_content->>'module_id' or title
  const [readingRow] = await db
    .select({ id: texts.id })
    .from(texts)
    .where(
      and(
        eq(texts.languageId, languageId),
        eq(texts.level, levelUpper),
        eq(texts.generationType, 'llm'),
        or(
          sql`${texts.structuredContent}->>'module_id' = ${moduleId}`,
          and(
            sql`(${texts.structuredContent}->>'module_id') is null`,
            titleMatchText,
          ),
        ),
      ),
    )
    .limit(1);
  result.reading = !!readingRow?.id;

  // Podcast: podcasts (languageId, cefrLevel) + rich_content->>'module_id' or title
  const [podcastRow] = await db
    .select({ id: podcasts.id })
    .from(podcasts)
    .where(
      and(
        eq(podcasts.languageId, languageId),
        eq(podcasts.cefrLevel, levelUpper),
        or(
          sql`${podcasts.richContent}->>'module_id' = ${moduleId}`,
          and(
            sql`(${podcasts.richContent}->>'module_id') is null`,
            titleMatchPodcast,
          ),
        ),
      ),
    )
    .limit(1);
  result.podcast = !!podcastRow?.id;

  // Speaking: slug is always {moduleId}-speaking
  const speakingSlug = `${moduleId}-speaking`;
  const [speakingRow] = await db
    .select({ id: speakingTopics.id })
    .from(speakingTopics)
    .where(
      and(
        eq(speakingTopics.languageId, languageId),
        eq(speakingTopics.slug, speakingSlug),
      ),
    )
    .limit(1);
  result.speaking = !!speakingRow?.id;

  return result;
}

/**
 * Loads lesson content from DB for the same (moduleId, level, targetLanguage) as the current run.
 * Used when running only reading/podcast/speaking so they get pass1Output (chunks) for validation and prompts.
 * Returns null if no lesson exists — ensures we never use content from another module or language.
 */
export async function getLessonContentForContext(
  db: DbClient,
  moduleId: string,
  level: string,
  targetLanguage: string,
): Promise<{ content: Record<string, unknown> } | null> {
  const meta = await getModuleMetadata(moduleId);
  const title = meta?.title ?? moduleId;
  const lang = targetLanguage.split('-')[0];
  const levelUpper = level.toUpperCase();
  const titleMatchLesson = sql`(lower(trim(${nativeLessons.title})) = lower(trim(${title})) or lower(trim(${nativeLessons.title})) = lower(trim(${moduleId})))`;

  const [lessonRow] = await db
    .select({ content: nativeLessons.content })
    .from(nativeLessons)
    .where(
      and(
        eq(nativeLessons.language, lang),
        eq(nativeLessons.level, levelUpper),
        or(
          sql`${nativeLessons.content}->>'module_id' = ${moduleId}`,
          and(
            sql`(${nativeLessons.content}->>'module_id') is null`,
            titleMatchLesson,
          ),
        ),
      ),
    )
    .orderBy(desc(nativeLessons.updatedAt))
    .limit(1);

  const content = lessonRow?.content as Record<string, unknown> | null;
  if (!content || typeof content !== 'object') return null;
  return { content };
}
