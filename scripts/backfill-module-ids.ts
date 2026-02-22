/**
 * One-time backfill: set module_id in existing content rows that don't have it.
 * Run this so the generate-content skip logic can find existing lessons/readings/podcasts.
 *
 *   npm run backfill-module-ids
 *
 * Matches by (language, level) + title (case-insensitive) to the module list.
 * Does not touch speaking_topics (they already use slug = {moduleId}-speaking).
 */

import * as path from 'node:path';
import dotenv from 'dotenv';
import { and, eq, sql } from 'drizzle-orm';
import { loadModuleList } from '@/features/content-generation/infrastructure/utils/module-list-parser';
import { db } from '@/infrastructure/db/client';
import { nativeLessons } from '@/infrastructure/db/schema/native-lessons';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { texts } from '@/infrastructure/db/schema/texts';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function normalizeTitle(s: string): string {
  return s.trim().toLowerCase();
}

type LevelModule = { moduleId: string; title: string };
type ByLevelMap = Map<string, LevelModule[]>;

function buildByLevel(
  modules: Awaited<ReturnType<typeof loadModuleList>>,
): ByLevelMap {
  const byLevel = new Map<string, LevelModule[]>();
  for (const m of modules) {
    const arr = byLevel.get(m.level) ?? [];
    arr.push({ moduleId: m.moduleId, title: m.title });
    byLevel.set(m.level, arr);
  }
  return byLevel;
}

function findModuleByTitle(
  levelModules: LevelModule[],
  normalizedTitle: string,
): LevelModule | undefined {
  return levelModules.find(
    (m) =>
      normalizeTitle(m.title) === normalizedTitle ||
      normalizeTitle(m.moduleId) === normalizedTitle,
  );
}

function groupBy<K extends string, V>(
  items: V[],
  keyFn: (v: V) => K,
): Map<K, V[]> {
  const map = new Map<K, V[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = map.get(key) ?? [];
    arr.push(item);
    map.set(key, arr);
  }
  return map;
}

async function backfillLessonsByTitle(byLevel: ByLevelMap): Promise<number> {
  const rows = await db
    .select({
      id: nativeLessons.id,
      language: nativeLessons.language,
      level: nativeLessons.level,
      title: nativeLessons.title,
    })
    .from(nativeLessons)
    .where(sql`(${nativeLessons.content}->>'module_id') is null`);
  let count = 0;
  for (const row of rows) {
    const match = findModuleByTitle(
      byLevel.get(row.level) ?? [],
      normalizeTitle(row.title),
    );
    if (!match) continue;
    await db
      .update(nativeLessons)
      .set({
        content: sql`coalesce(${nativeLessons.content}, '{}'::jsonb) || jsonb_build_object('module_id', (${match.moduleId})::text)`,
        updatedAt: new Date(),
      })
      .where(eq(nativeLessons.id, row.id));
    count++;
    console.log(
      `  lesson ${row.language}/${row.level}: "${row.title}" → module_id=${match.moduleId}`,
    );
  }
  return count;
}

async function backfillLessonsByOrder(byLevel: ByLevelMap): Promise<number> {
  let count = 0;
  for (const [level, levelModules] of byLevel) {
    if (levelModules.length === 0) continue;
    const stillNull = await db
      .select({
        id: nativeLessons.id,
        language: nativeLessons.language,
        sortOrder: nativeLessons.sortOrder,
      })
      .from(nativeLessons)
      .where(
        and(
          eq(nativeLessons.level, level),
          sql`(${nativeLessons.content}->>'module_id') is null`,
        ),
      )
      .orderBy(nativeLessons.language, nativeLessons.sortOrder);
    const byLang = groupBy(stillNull, (r) => r.language);
    for (const rows of byLang.values()) {
      for (let i = 0; i < rows.length && i < levelModules.length; i++) {
        const moduleId = levelModules[i].moduleId;
        await db
          .update(nativeLessons)
          .set({
            content: sql`coalesce(${nativeLessons.content}, '{}'::jsonb) || jsonb_build_object('module_id', (${moduleId})::text)`,
            updatedAt: new Date(),
          })
          .where(eq(nativeLessons.id, rows[i].id));
        count++;
        console.log(
          `  lesson (by order) ${rows[i].language}/${level} → module_id=${moduleId}`,
        );
      }
    }
  }
  return count;
}

async function backfillTextsByTitle(byLevel: ByLevelMap): Promise<number> {
  const rows = await db
    .select({
      id: texts.id,
      languageId: texts.languageId,
      level: texts.level,
      title: texts.title,
    })
    .from(texts)
    .where(
      and(
        eq(texts.generationType, 'llm'),
        sql`(${texts.structuredContent}->>'module_id') is null`,
      ),
    );
  let count = 0;
  for (const row of rows) {
    const match = findModuleByTitle(
      byLevel.get(row.level) ?? [],
      normalizeTitle(row.title),
    );
    if (!match) continue;
    await db
      .update(texts)
      .set({
        structuredContent: sql`coalesce(${texts.structuredContent}, '{}'::jsonb) || jsonb_build_object('module_id', (${match.moduleId})::text)`,
        updatedAt: new Date(),
      })
      .where(eq(texts.id, row.id));
    count++;
    console.log(
      `  text ${row.level}: "${row.title}" → module_id=${match.moduleId}`,
    );
  }
  return count;
}

async function backfillTextsByOrder(byLevel: ByLevelMap): Promise<number> {
  let count = 0;
  for (const [level, levelModules] of byLevel) {
    if (levelModules.length === 0) continue;
    const stillNull = await db
      .select({ id: texts.id, languageId: texts.languageId })
      .from(texts)
      .where(
        and(
          eq(texts.level, level),
          eq(texts.generationType, 'llm'),
          sql`(${texts.structuredContent}->>'module_id') is null`,
        ),
      )
      .orderBy(texts.id);
    const byLang = groupBy(stillNull, (r) => r.languageId);
    for (const rows of byLang.values()) {
      for (let i = 0; i < rows.length && i < levelModules.length; i++) {
        const moduleId = levelModules[i].moduleId;
        await db
          .update(texts)
          .set({
            structuredContent: sql`coalesce(${texts.structuredContent}, '{}'::jsonb) || jsonb_build_object('module_id', (${moduleId})::text)`,
            updatedAt: new Date(),
          })
          .where(eq(texts.id, rows[i].id));
        count++;
        console.log(`  text (by order) ${level} → module_id=${moduleId}`);
      }
    }
  }
  return count;
}

async function backfillPodcastsByTitle(byLevel: ByLevelMap): Promise<number> {
  const rows = await db
    .select({
      id: podcasts.id,
      languageId: podcasts.languageId,
      cefrLevel: podcasts.cefrLevel,
      title: podcasts.title,
    })
    .from(podcasts)
    .where(sql`(${podcasts.richContent}->>'module_id') is null`);
  let count = 0;
  for (const row of rows) {
    const match = findModuleByTitle(
      byLevel.get(row.cefrLevel) ?? [],
      normalizeTitle(row.title),
    );
    if (!match) continue;
    await db
      .update(podcasts)
      .set({
        richContent: sql`coalesce(${podcasts.richContent}, '{}'::jsonb) || jsonb_build_object('module_id', (${match.moduleId})::text)`,
        updatedAt: new Date(),
      })
      .where(eq(podcasts.id, row.id));
    count++;
    console.log(
      `  podcast ${row.cefrLevel}: "${row.title}" → module_id=${match.moduleId}`,
    );
  }
  return count;
}

async function backfillPodcastsByOrder(byLevel: ByLevelMap): Promise<number> {
  let count = 0;
  for (const [level, levelModules] of byLevel) {
    if (levelModules.length === 0) continue;
    const stillNull = await db
      .select({ id: podcasts.id, languageId: podcasts.languageId })
      .from(podcasts)
      .where(
        and(
          eq(podcasts.cefrLevel, level),
          sql`(${podcasts.richContent}->>'module_id') is null`,
        ),
      )
      .orderBy(podcasts.id);
    const byLang = groupBy(stillNull, (r) => r.languageId);
    for (const rows of byLang.values()) {
      for (let i = 0; i < rows.length && i < levelModules.length; i++) {
        const moduleId = levelModules[i].moduleId;
        await db
          .update(podcasts)
          .set({
            richContent: sql`coalesce(${podcasts.richContent}, '{}'::jsonb) || jsonb_build_object('module_id', (${moduleId})::text)`,
            updatedAt: new Date(),
          })
          .where(eq(podcasts.id, rows[i].id));
        count++;
        console.log(`  podcast (by order) ${level} → module_id=${moduleId}`);
      }
    }
  }
  return count;
}

async function main(): Promise<void> {
  const byLevel = buildByLevel(await loadModuleList());

  const lessonsUpdated =
    (await backfillLessonsByTitle(byLevel)) +
    (await backfillLessonsByOrder(byLevel));
  const textsUpdated =
    (await backfillTextsByTitle(byLevel)) +
    (await backfillTextsByOrder(byLevel));
  const podcastsUpdated =
    (await backfillPodcastsByTitle(byLevel)) +
    (await backfillPodcastsByOrder(byLevel));

  console.log('\nDone.');
  console.log(`  Lessons updated: ${lessonsUpdated}`);
  console.log(`  Texts updated: ${textsUpdated}`);
  console.log(`  Podcasts updated: ${podcastsUpdated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
