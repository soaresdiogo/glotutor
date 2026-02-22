/**
 * Audit content generation: compare what exists in the DB (and optionally MinIO)
 * with what should exist for a given phase (P1, P2, P3) or all phases.
 *
 * Usage:
 *   npm run audit:p1-content              # P1 only (default, same as generate-content --batch p1)
 *   npm run audit:p2-content              # P2 only
 *   npm run audit:p3-content              # P3 only
 *   npm run audit:content                 # all phases (P1 + P2 + P3)
 *   npm run audit:p1-content -- --check-minio   # also verify podcast audio in S3/MinIO
 *   npm run audit:p1-content -- --target en-US  # one language only
 *   npm run audit:p1-content -- --json          # machine-readable output
 *   npm run audit:p1-content -- --phase P2      # same as audit:p2-content
 *   npm run audit:p1-content -- --phase all     # same as audit:content
 *
 * Phases (from 06-MODULE-LIST.md):
 *   P1: A1 1-5, A2 1-5, B1 1-5, B2 1-3 (18 modules)
 *   P2: A1 6-10, A2 6-10, B1 6-10, B2 4-10, C1 1-5
 *   P3: C1 6-10, C2 1-10
 *
 * Per target: native_lessons, texts, podcasts, speaking_topics. Podcast audio optional (TTS).
 */

import * as path from 'node:path';

import dotenv from 'dotenv';
import { and, eq, or, sql } from 'drizzle-orm';
import { getExistingPasses } from '@/features/content-generation/infrastructure/services/module-content-existence.service';
import {
  getModuleMetadata,
  loadModuleList,
} from '@/features/content-generation/infrastructure/utils/module-list-parser';
import { db } from '@/infrastructure/db/client';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import {
  getKeyFromStoredUrl,
  objectExistsByKey,
} from '@/shared/lib/reading/s3-upload';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_TARGETS = ['en-US', 'fr-FR', 'es-ES', 'it-IT', 'de-DE'] as const;

interface AuditRow {
  target: string;
  moduleId: string;
  level: string;
  lesson: boolean;
  reading: boolean;
  podcast: boolean;
  speaking: boolean;
  podcastHasAudio: boolean;
  podcastAudioInMinio: boolean | null; // null = not checked or URL not ours
}

async function resolveLanguageId(
  targetLanguage: string,
): Promise<string | null> {
  const code = targetLanguage.split('-')[0];
  const row = await db.query.supportedLanguages.findFirst({
    where: eq(supportedLanguages.code, code),
    columns: { id: true },
  });
  return row?.id ?? null;
}

async function getPodcastAudioInfo(
  targetLanguage: string,
  moduleId: string,
  level: string,
): Promise<{ id: string; audioUrl: string } | null> {
  const languageId = await resolveLanguageId(targetLanguage);
  if (!languageId) return null;
  const meta = await getModuleMetadata(moduleId);
  const title = meta?.title ?? moduleId;
  const levelUpper = level.toUpperCase();
  const titleMatch = sql`(lower(trim(${podcasts.title})) = lower(trim(${title})) or lower(trim(${podcasts.title})) = lower(trim(${moduleId})))`;
  const [row] = await db
    .select({ id: podcasts.id, audioUrl: podcasts.audioUrl })
    .from(podcasts)
    .where(
      and(
        eq(podcasts.languageId, languageId),
        eq(podcasts.cefrLevel, levelUpper),
        or(
          sql`${podcasts.richContent}->>'module_id' = ${moduleId}`,
          and(sql`(${podcasts.richContent}->>'module_id') is null`, titleMatch),
        ),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function runAudit(
  targets: string[],
  checkMinio: boolean,
  phaseFilter: string,
): Promise<AuditRow[]> {
  const list = await loadModuleList();
  const modules =
    phaseFilter === 'all'
      ? list
      : list.filter(
          (m) => (m.phase ?? '').toUpperCase() === phaseFilter.toUpperCase(),
        );
  const results: AuditRow[] = [];

  for (const target of targets) {
    for (const m of modules) {
      const existing = await getExistingPasses(db, m.moduleId, m.level, target);
      const podcastInfo = existing.podcast
        ? await getPodcastAudioInfo(target, m.moduleId, m.level)
        : null;
      const audioUrl = podcastInfo?.audioUrl?.trim() ?? '';
      const hasAudio = audioUrl.length > 0;
      let audioInMinio: boolean | null = null;
      if (checkMinio && hasAudio) {
        const key = getKeyFromStoredUrl(audioUrl);
        audioInMinio = key !== null ? await objectExistsByKey(key) : null;
      }
      results.push({
        target,
        moduleId: m.moduleId,
        level: m.level,
        lesson: existing.lesson,
        reading: existing.reading,
        podcast: existing.podcast,
        speaking: existing.speaking,
        podcastHasAudio: hasAudio,
        podcastAudioInMinio: audioInMinio,
      });
    }
  }

  return results;
}

function formatPassLine(
  ok: number,
  total: number,
  missingLabel: string,
): string {
  const status = ok === total ? '✓' : missingLabel;
  return `${ok}/${total}  ${status}`;
}

function printTargetBlock(
  target: string,
  byTarget: AuditRow[],
  total: number,
  checkMinio: boolean,
): void {
  const lessonOk = byTarget.filter((r) => r.lesson).length;
  const readingOk = byTarget.filter((r) => r.reading).length;
  const podcastOk = byTarget.filter((r) => r.podcast).length;
  const speakingOk = byTarget.filter((r) => r.speaking).length;
  const podcastWithAudio = byTarget.filter((r) => r.podcastHasAudio).length;
  const podcastAudioMissingInMinio = checkMinio
    ? byTarget.filter(
        (r) => r.podcastHasAudio && r.podcastAudioInMinio === false,
      ).length
    : 0;

  console.log(`[${target}]`);
  console.log(
    `  native_lessons:   ${formatPassLine(lessonOk, total, 'MISSING')}`,
  );
  console.log(
    `  texts (reading):   ${formatPassLine(readingOk, total, 'MISSING')}`,
  );
  console.log(
    `  podcasts (row):    ${formatPassLine(podcastOk, total, 'MISSING')}`,
  );
  console.log(
    `  podcast audio:     ${formatPassLine(podcastWithAudio, total, 'TTS pending or missing')}`,
  );
  if (checkMinio && podcastWithAudio > 0) {
    const inMinio = podcastWithAudio - podcastAudioMissingInMinio;
    const status =
      podcastAudioMissingInMinio === 0
        ? '✓'
        : `${podcastAudioMissingInMinio} missing in storage`;
    console.log(
      `  podcast in MinIO:  ${inMinio}/${podcastWithAudio}  ${status}`,
    );
  }
  console.log(
    `  speaking_topics:   ${formatPassLine(speakingOk, total, 'MISSING')}`,
  );
  console.log('');
}

interface MissingSections {
  missingLesson: AuditRow[];
  missingReading: AuditRow[];
  missingPodcast: AuditRow[];
  missingSpeaking: AuditRow[];
  podcastNoAudio: AuditRow[];
  podcastNotInMinio: AuditRow[];
}

function computeMissingSections(rows: AuditRow[]): MissingSections {
  return {
    missingLesson: rows.filter((r) => !r.lesson),
    missingReading: rows.filter((r) => !r.reading),
    missingPodcast: rows.filter((r) => !r.podcast),
    missingSpeaking: rows.filter((r) => !r.speaking),
    podcastNoAudio: rows.filter((r) => r.podcast && !r.podcastHasAudio),
    podcastNotInMinio: rows.filter(
      (r) => r.podcastHasAudio && r.podcastAudioInMinio === false,
    ),
  };
}

function hasAnyMissing(m: MissingSections): boolean {
  return (
    m.missingLesson.length > 0 ||
    m.missingReading.length > 0 ||
    m.missingPodcast.length > 0 ||
    m.missingSpeaking.length > 0 ||
    m.podcastNoAudio.length > 0 ||
    m.podcastNotInMinio.length > 0
  );
}

const PASS_COMMANDS: Record<
  keyof Pick<
    MissingSections,
    'missingLesson' | 'missingReading' | 'missingPodcast' | 'missingSpeaking'
  >,
  { title: string; pass: string }
> = {
  missingLesson: {
    title: 'Missing native_lessons (run generate-content for these):',
    pass: 'lesson',
  },
  missingReading: { title: 'Missing texts/reading:', pass: 'reading' },
  missingPodcast: { title: 'Missing podcasts (row):', pass: 'podcast' },
  missingSpeaking: { title: 'Missing speaking_topics:', pass: 'speaking' },
};

function printMissingContentSection(
  rows: AuditRow[],
  key: keyof typeof PASS_COMMANDS,
): void {
  const { title, pass } = PASS_COMMANDS[key];
  console.log(title);
  for (const r of rows) {
    console.log(
      `  npm run generate-content -- --module ${r.moduleId} --level ${r.level} --target ${r.target} --native pt-BR --passes ${pass}`,
    );
  }
  console.log('');
}

function printMissingSections(m: MissingSections): void {
  console.log('--- Missing or incomplete (use to regenerate) ---\n');
  const contentKeys: (keyof typeof PASS_COMMANDS)[] = [
    'missingLesson',
    'missingReading',
    'missingPodcast',
    'missingSpeaking',
  ];
  for (const key of contentKeys) {
    if (m[key].length > 0) {
      printMissingContentSection(m[key], key);
    }
  }
  if (m.podcastNoAudio.length > 0) {
    console.log(
      'Podcasts without audio (TTS not run; use generate-podcast-tts or your TTS pipeline):',
    );
    for (const r of m.podcastNoAudio) {
      console.log(`  ${r.target} / ${r.moduleId} (${r.level})`);
    }
    console.log('');
  }
  if (m.podcastNotInMinio.length > 0) {
    console.log('Podcasts with audioUrl but file missing in MinIO:');
    for (const r of m.podcastNotInMinio) {
      console.log(`  ${r.target} / ${r.moduleId} (${r.level})`);
    }
  }
}

function printReport(
  rows: AuditRow[],
  checkMinio: boolean,
  phaseLabel: string,
): void {
  const targets = [...new Set(rows.map((r) => r.target))].sort();
  const moduleIds = [...new Set(rows.map((r) => r.moduleId))].sort();

  console.log(`\n=== Content audit (${phaseLabel}) ===\n`);
  console.log(
    `Expected: ${moduleIds.length} modules × ${targets.length} languages = ${moduleIds.length * targets.length} rows per pass.\n`,
  );

  const total = moduleIds.length;
  for (const target of targets) {
    const byTarget = rows.filter((r) => r.target === target);
    printTargetBlock(target, byTarget, total, checkMinio);
  }

  const missing = computeMissingSections(rows);
  if (hasAnyMissing(missing)) {
    printMissingSections(missing);
  } else {
    console.log('All P1 content and podcast audio are present.\n');
  }
}

function printJson(rows: AuditRow[]): void {
  const targets = [...new Set(rows.map((r) => r.target))].sort();
  const byTarget: Record<
    string,
    {
      lesson: number;
      reading: number;
      podcast: number;
      speaking: number;
      podcastWithAudio: number;
      podcastAudioInMinio: number;
    }
  > = {};
  for (const target of targets) {
    const byTargetRows = rows.filter((r) => r.target === target);
    byTarget[target] = {
      lesson: byTargetRows.filter((r) => r.lesson).length,
      reading: byTargetRows.filter((r) => r.reading).length,
      podcast: byTargetRows.filter((r) => r.podcast).length,
      speaking: byTargetRows.filter((r) => r.speaking).length,
      podcastWithAudio: byTargetRows.filter((r) => r.podcastHasAudio).length,
      podcastAudioInMinio: byTargetRows.filter(
        (r) => r.podcastAudioInMinio === true,
      ).length,
    };
  }
  const missing = {
    lesson: rows
      .filter((r) => !r.lesson)
      .map((r) => ({ target: r.target, moduleId: r.moduleId, level: r.level })),
    reading: rows
      .filter((r) => !r.reading)
      .map((r) => ({ target: r.target, moduleId: r.moduleId, level: r.level })),
    podcast: rows
      .filter((r) => !r.podcast)
      .map((r) => ({ target: r.target, moduleId: r.moduleId, level: r.level })),
    speaking: rows
      .filter((r) => !r.speaking)
      .map((r) => ({ target: r.target, moduleId: r.moduleId, level: r.level })),
    podcastNoAudio: rows
      .filter((r) => r.podcast && !r.podcastHasAudio)
      .map((r) => ({ target: r.target, moduleId: r.moduleId, level: r.level })),
    podcastNotInMinio: rows
      .filter((r) => r.podcastHasAudio && r.podcastAudioInMinio === false)
      .map((r) => ({ target: r.target, moduleId: r.moduleId, level: r.level })),
  };
  const summary = { totalRows: rows.length, byTarget, missing };
  console.log(JSON.stringify({ summary, rows }, null, 2));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const checkMinio = args.includes('--check-minio');
  const json = args.includes('--json');
  const targetIdx = args.indexOf('--target');
  const targets =
    targetIdx !== -1 && args[targetIdx + 1]
      ? [args[targetIdx + 1]]
      : [...DEFAULT_TARGETS];
  const phaseIdx = args.indexOf('--phase');
  const phaseArg =
    phaseIdx !== -1 && args[phaseIdx + 1] ? args[phaseIdx + 1] : 'P1';
  const phaseFilter = phaseArg.toLowerCase() === 'all' ? 'all' : phaseArg;
  const phaseLabel =
    phaseFilter === 'all' ? 'all phases' : `phase ${phaseFilter}`;

  const rows = await runAudit(targets, checkMinio, phaseFilter);
  if (json) {
    printJson(rows);
  } else {
    printReport(rows, checkMinio, phaseLabel);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
