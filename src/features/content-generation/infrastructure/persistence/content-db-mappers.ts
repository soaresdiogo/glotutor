import { and, eq, sql } from 'drizzle-orm';
import type { ModuleSpec } from '@/features/content-generation/domain/types/generation-request.types';
import { nativeLessons } from '@/infrastructure/db/schema/native-lessons';
import { podcastExercises } from '@/infrastructure/db/schema/podcast-exercises';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { speakingExercises } from '@/infrastructure/db/schema/speaking-exercises';
import { speakingTopics } from '@/infrastructure/db/schema/speaking-topics';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import { texts } from '@/infrastructure/db/schema/texts';
import type { DbClient } from '@/infrastructure/db/types';
import { invalidateReadingTextsCache } from '@/shared/lib/reading/redis-client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve language UUID from supported_languages by language code.
 * Never use moduleId or any non-language identifier here.
 */
async function resolveLanguageId(
  db: DbClient,
  targetLanguage: string,
): Promise<string> {
  const code = targetLanguage.split('-')[0];
  const row = await db.query.supportedLanguages.findFirst({
    where: eq(supportedLanguages.code, code),
    columns: { id: true },
  });
  if (!row?.id) throw new Error(`Unsupported language: ${targetLanguage}`);
  return row.id;
}

function langCode(spec: ModuleSpec): string {
  return spec.targetLanguage.split('-')[0];
}

// ---------------------------------------------------------------------------
// LESSON — saves the FULL content object to native_lessons.content (jsonb)
// ---------------------------------------------------------------------------

export async function saveLessonToDb(
  db: DbClient,
  output: unknown,
  spec: ModuleSpec,
): Promise<void> {
  const o = output as { content?: Record<string, unknown> };
  const content = o.content ?? {};
  const lang = langCode(spec);
  const title = spec.title || spec.moduleId;

  const dialogue = content.dialogue as
    | { setting?: string; emotional_tone?: string }
    | undefined;
  const description =
    [spec.situationalTheme, dialogue?.setting, dialogue?.emotional_tone]
      .filter(Boolean)
      .join(' — ') || null;

  const [maxRow] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${nativeLessons.sortOrder}), 0)`,
    })
    .from(nativeLessons)
    .where(
      and(
        eq(nativeLessons.language, lang),
        eq(nativeLessons.level, spec.cefrLevel),
      ),
    );
  const sortOrder = (maxRow?.maxOrder ?? 0) + 1;

  await db.insert(nativeLessons).values({
    language: lang,
    level: spec.cefrLevel,
    title,
    description,
    sortOrder,
    content: content as object,
    isPublished: true,
  });
}

// ---------------------------------------------------------------------------
// READING — stores the FULL reading output as content (JSON string) and structured_content (jsonb)
// ---------------------------------------------------------------------------
//
// The reading_text.content for structured formats (whatsapp_chat, reddit_post, etc.)
// is an object, not a string. We store the ENTIRE generation output so the frontend
// can render by format type.
//

export async function saveReadingToDb(
  db: DbClient,
  output: unknown,
  spec: ModuleSpec,
): Promise<void> {
  // languageId must be from supported_languages (by targetLanguage code), never from moduleId
  const languageId = await resolveLanguageId(db, spec.targetLanguage);
  const o = output as { content?: Record<string, unknown> };
  const content = o.content ?? {};
  const readingText = content.reading_text as
    | Record<string, unknown>
    | undefined;

  const rt = readingText as
    | {
        title?: string;
        word_count?: number;
        format?: string;
      }
    | undefined;
  const title = rt?.title || spec.title || spec.moduleId;

  const fullContent = JSON.stringify(content);

  await db.insert(texts).values({
    languageId,
    title,
    content: fullContent,
    structuredContent: content as object,
    category: rt?.format || spec.readingFormat || 'reading',
    level: spec.cefrLevel,
    cefrLevel: spec.cefrLevel,
    wordCount: rt?.word_count ?? null,
    generationType: 'llm',
    isPublished: true,
  });

  await invalidateReadingTextsCache();
}

// ---------------------------------------------------------------------------
// PODCAST — stores full script + all exercise types; rich content in rich_content jsonb
// ---------------------------------------------------------------------------

export async function savePodcastToDb(
  db: DbClient,
  output: unknown,
  spec: ModuleSpec,
): Promise<string | null> {
  const languageId = await resolveLanguageId(db, spec.targetLanguage);
  const o = output as { content?: Record<string, unknown> };
  const content = o.content ?? {};

  const episode = content.episode as
    | { title?: string; description?: string }
    | undefined;
  const script = content.script as
    | {
        sections?: Array<{
          lines?: Array<{ speaker?: string; text?: string; tone?: string }>;
        }>;
      }
    | undefined;

  const allLines = script?.sections?.flatMap((s) => s.lines ?? []) ?? [];
  const transcript = allLines
    .map((l) => (l.speaker ? `${l.speaker}: ${l.text}` : l.text))
    .filter(Boolean)
    .join('\n');

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;
  const durationSeconds = Math.ceil((wordCount / 150) * 60);

  const richContent = {
    episode: content.episode,
    script: content.script,
    connected_speech_version: content.connected_speech_version,
    exercises: content.exercises,
    speed_versions: content.speed_versions,
    adaptive_metadata: content.adaptive_metadata,
  };

  const [inserted] = await db
    .insert(podcasts)
    .values({
      languageId,
      title: episode?.title ?? spec.title ?? spec.moduleId,
      description: episode?.description ?? '',
      cefrLevel: spec.cefrLevel,
      audioUrl: '',
      transcript: transcript || 'Generated script pending TTS.',
      durationSeconds,
      vocabularyHighlights: [],
      richContent: richContent as object,
    })
    .returning();

  if (!inserted) return null;

  const exercises = content.exercises as
    | {
        pre_listening?: Array<Record<string, unknown>>;
        while_listening?: Array<Record<string, unknown>>;
        post_listening?: Array<Record<string, unknown>>;
      }
    | undefined;

  const allExercises = [
    ...(exercises?.pre_listening ?? []).map((e) => ({ ...e, _phase: 'pre' })),
    ...(exercises?.while_listening ?? []).map((e) => ({
      ...e,
      _phase: 'while',
    })),
    ...(exercises?.post_listening ?? []).map((e) => ({ ...e, _phase: 'post' })),
  ];

  for (let i = 0; i < allExercises.length; i++) {
    const ex = allExercises[i] as Record<string, unknown>;
    const exerciseContent = ex.content as Record<string, unknown> | undefined;

    await db.insert(podcastExercises).values({
      podcastId: inserted.id,
      questionNumber: i + 1,
      type: mapExerciseType(ex.type as string),
      questionText:
        (exerciseContent?.question as string) ??
        (ex.instruction as string) ??
        '',
      options: (exerciseContent?.options as string[]) ?? null,
      correctAnswer: (exerciseContent?.correct_answer as string) ?? '',
      explanationText: (exerciseContent?.explanation as string) ?? '',
    });
  }

  return inserted.id;
}

function mapExerciseType(
  type?: string,
):
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'sentence_order'
  | 'open_ended' {
  if (!type) return 'open_ended';
  const map: Record<
    string,
    | 'multiple_choice'
    | 'true_false'
    | 'fill_blank'
    | 'sentence_order'
    | 'open_ended'
  > = {
    gap_fill_audio: 'fill_blank',
    true_false: 'true_false',
    sequence_order: 'sentence_order',
    speaker_identification: 'multiple_choice',
    chunk_catch: 'fill_blank',
    prediction: 'open_ended',
    vocabulary_preview: 'open_ended',
    context_activation: 'open_ended',
    chunk_extraction: 'open_ended',
    retelling: 'open_ended',
    opinion_response: 'open_ended',
    connected_speech_identification: 'open_ended',
    summary: 'open_ended',
  };
  return map[type] ?? 'open_ended';
}

// ---------------------------------------------------------------------------
// SPEAKING — stores full scenario data in context_prompt (JSON string) and rich_content (jsonb)
// ---------------------------------------------------------------------------
//
// The frontend can parse context_prompt when it starts with "{" to get scenarios,
// evaluation criteria, fluency_gym. rich_content holds the same for querying.
//

export async function saveSpeakingToDb(
  db: DbClient,
  output: unknown,
  spec: ModuleSpec,
): Promise<void> {
  const languageId = await resolveLanguageId(db, spec.targetLanguage);
  const o = output as { content?: Record<string, unknown> };
  const content = o.content ?? {};
  const scenarios = (content.scenarios as Array<Record<string, unknown>>) ?? [];
  const first = scenarios[0] as
    | {
        title?: string;
        situation?: { description_for_learner?: string };
        target_chunks?: { primary?: string[] };
        ai_character?: Record<string, unknown>;
      }
    | undefined;

  const slug = `${spec.moduleId}-speaking`;
  const description =
    first?.situation?.description_for_learner ?? spec.situationalTheme ?? '';

  const richContextPrompt = JSON.stringify(content);

  const keyVocabulary = first?.target_chunks?.primary ?? [];

  const nativeExpressions = scenarios
    .flatMap(
      (s) =>
        (s as { target_chunks?: { bonus?: string[] } }).target_chunks?.bonus ??
        [],
    )
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 20);

  const [inserted] = await db
    .insert(speakingTopics)
    .values({
      languageId,
      slug,
      title: first?.title ?? spec.title ?? spec.moduleId,
      description,
      cefrLevel: spec.cefrLevel,
      contextPrompt: richContextPrompt,
      richContent: content as object,
      keyVocabulary,
      nativeExpressions,
      sortOrder: 0,
    })
    .returning({ id: speakingTopics.id });

  if (!inserted) return;

  const fixationExercises = (content.fixation_exercises ?? []) as Array<
    Record<string, unknown>
  >;
  const allowedTypes = [
    'fill_blank',
    'multiple_choice',
    'reorder_sentence',
    'match_expression',
  ] as const;

  for (let i = 0; i < fixationExercises.length; i++) {
    const ex = fixationExercises[i];
    const typeRaw = (ex.type as string) ?? 'fill_blank';
    const type = allowedTypes.includes(typeRaw as (typeof allowedTypes)[number])
      ? (typeRaw as (typeof allowedTypes)[number])
      : 'fill_blank';
    const questionNumber = Number(ex.question_number) || i + 1;
    const questionText = (
      typeof ex.question_text === 'string' ? ex.question_text : ''
    ).trim();
    const correctAnswer = (
      typeof ex.correct_answer === 'string' ? ex.correct_answer : ''
    ).trim();
    const explanationText = (
      typeof ex.explanation_text === 'string' ? ex.explanation_text : ''
    ).trim();
    if (!questionText || !correctAnswer) continue;

    const options = ex.options as string[] | Record<string, string>[] | null;
    await db.insert(speakingExercises).values({
      topicId: inserted.id,
      questionNumber,
      type,
      questionText,
      options: options ?? null,
      correctAnswer,
      explanationText,
    });
  }
}
