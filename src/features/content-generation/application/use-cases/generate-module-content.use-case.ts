import type { IContentGeneratorPort } from '@/features/content-generation/domain/ports/content-generator.interface';
import type { IModuleSpecResolver } from '@/features/content-generation/domain/ports/module-spec-resolver.interface';
import type {
  IPromptComposer,
  PreviousPassOutputs,
} from '@/features/content-generation/domain/ports/prompt-composer.interface';
import type {
  ContentPass,
  GenerationRequest,
  ModuleSpec,
} from '@/features/content-generation/domain/types/generation-request.types';
import {
  type ValidationResult,
  validateLessonOutput,
  validatePodcastOutput,
  validateReadingOutput,
  validateSpeakingOutput,
} from '@/features/content-generation/infrastructure/utils/content-validator';
import {
  extractPass1Context,
  extractPass2Context,
  extractPass3Context,
} from '@/features/content-generation/infrastructure/utils/context-extractor';
import { normalizeLessonOutput } from '@/features/content-generation/infrastructure/utils/lesson-output-normalizer';

const PASS_ORDER: ContentPass[] = ['lesson', 'reading', 'podcast', 'speaking'];

/** Patchable validation errors: we fix with a small LLM call and merge, instead of full regeneration. */
type LessonPatchKind =
  | { type: 'lesson_exercises'; currentCount: number; required: number }
  | {
      type: 'lesson_section_examples';
      sectionIndex: number;
      sectionTitle?: string;
      currentCount: number;
    }
  | { type: 'lesson_section_count'; currentCount: number; required: number }
  | { type: 'lesson_grammar_terminology'; detectedTerm: string }
  | { type: 'lesson_chunk_count'; currentCount: number; required: number }
  | { type: 'lesson_speech_map' };
type ReadingPatchKind =
  | { type: 'reading_chunk_coverage'; usedCount: number; totalChunks: number }
  | { type: 'reading_comprehension_count'; currentCount: number }
  | { type: 'reading_word_count'; currentWordCount: number; minWords: number };
type PodcastPatchKind = {
  type: 'podcast_exercises';
  pre: number;
  while_: number;
  post: number;
  required: number;
};
type PatchKind = LessonPatchKind | ReadingPatchKind | PodcastPatchKind;

function tryLessonSectionCount(err: string, kinds: PatchKind[]): boolean {
  const m = /Only (\d+) CONCEPT sections — minimum (\d+) required/.exec(err);
  if (!m) return false;
  const current = Number.parseInt(m[1], 10);
  const required = Number.parseInt(m[2], 10);
  if (
    current < required &&
    !kinds.some((k) => k.type === 'lesson_section_count')
  )
    kinds.push({
      type: 'lesson_section_count',
      currentCount: current,
      required,
    });
  return true;
}

function tryLessonExercises(err: string, kinds: PatchKind[]): boolean {
  const m = /Only (\d+) exercises — minimum (\d+) required/.exec(err);
  if (!m) return false;
  const current = Number.parseInt(m[1], 10);
  const required = Number.parseInt(m[2], 10);
  if (current < required && !kinds.some((k) => k.type === 'lesson_exercises'))
    kinds.push({ type: 'lesson_exercises', currentCount: current, required });
  return true;
}

function tryLessonGrammar(err: string, kinds: PatchKind[]): boolean {
  const m =
    /Grammar terminology detected: "([^"]+)" — grammar must be invisible/.exec(
      err,
    );
  if (!m) return false;
  if (!kinds.some((k) => k.type === 'lesson_grammar_terminology'))
    kinds.push({ type: 'lesson_grammar_terminology', detectedTerm: m[1] });
  return true;
}

function tryLessonChunkCount(err: string, kinds: PatchKind[]): boolean {
  const m = /Chunk count (\d+) below minimum (\d+)/.exec(err);
  if (!m) return false;
  if (!kinds.some((k) => k.type === 'lesson_chunk_count'))
    kinds.push({
      type: 'lesson_chunk_count',
      currentCount: Number.parseInt(m[1], 10),
      required: Number.parseInt(m[2], 10),
    });
  return true;
}

function tryLessonSpeechMap(err: string, kinds: PatchKind[]): boolean {
  if (!err.includes('No connected speech features found')) return false;
  if (!kinds.some((k) => k.type === 'lesson_speech_map'))
    kinds.push({ type: 'lesson_speech_map' });
  return true;
}

function tryLessonSectionExamples(
  err: string,
  sections: Array<{ title?: string; content?: { examples?: unknown[] } }>,
  kinds: PatchKind[],
): boolean {
  const m = /Section (\d+) has only (\d+) example/.exec(err);
  if (!m) return false;
  const sectionIndex = Number.parseInt(m[1], 10) - 1;
  const currentCount = Number.parseInt(m[2], 10);
  const section = sections[sectionIndex];
  if (sectionIndex >= 0 && sectionIndex < sections.length && currentCount < 2)
    kinds.push({
      type: 'lesson_section_examples',
      sectionIndex,
      sectionTitle: section?.title,
      currentCount,
    });
  return true;
}

function classifyLessonPatchKinds(
  errors: string[],
  content: Record<string, unknown>,
  kinds: PatchKind[],
): void {
  const sections =
    (content.sections as Array<{
      title?: string;
      content?: { examples?: unknown[] };
    }>) ?? [];
  for (const e of errors) {
    if (tryLessonSectionCount(e, kinds)) continue;
    if (tryLessonExercises(e, kinds)) continue;
    if (tryLessonGrammar(e, kinds)) continue;
    if (tryLessonChunkCount(e, kinds)) continue;
    if (tryLessonSpeechMap(e, kinds)) continue;
    tryLessonSectionExamples(e, sections, kinds);
  }
}

function classifyReadingPatchKinds(
  errors: string[],
  content: Record<string, unknown>,
  pass1Output: unknown,
  kinds: PatchKind[],
): void {
  const readingText = content.reading_text as
    | { chunks_used?: string[] }
    | undefined;
  const totalChunks =
    (pass1Output as { content?: { chunks?: unknown[] } })?.content?.chunks
      ?.length ?? 0;
  for (const e of errors) {
    if (
      (e.includes('Chunk coverage') || e.includes('chunks used')) &&
      totalChunks > 0 &&
      !kinds.some((k) => k.type === 'reading_chunk_coverage')
    ) {
      kinds.push({
        type: 'reading_chunk_coverage',
        usedCount: readingText?.chunks_used?.length ?? 0,
        totalChunks,
      });
      continue;
    }
    const compMatch = /got (\d+)\)/.exec(e);
    if (e.includes('exactly 10 questions') && compMatch) {
      const current = Number.parseInt(compMatch[1], 10);
      if (!kinds.some((k) => k.type === 'reading_comprehension_count'))
        kinds.push({
          type: 'reading_comprehension_count',
          currentCount: current,
        });
      continue;
    }
    const wordCountMatch = /Word count (\d+) below minimum (\d+)/.exec(e);
    if (wordCountMatch && !kinds.some((k) => k.type === 'reading_word_count')) {
      kinds.push({
        type: 'reading_word_count',
        currentWordCount: Number.parseInt(wordCountMatch[1], 10),
        minWords: Number.parseInt(wordCountMatch[2], 10),
      });
    }
  }
}

function classifyPodcastPatchKinds(
  content: Record<string, unknown>,
  kinds: PatchKind[],
): void {
  const exercises = content.exercises as
    | {
        pre_listening?: unknown[];
        while_listening?: unknown[];
        post_listening?: unknown[];
      }
    | undefined;
  const pre = exercises?.pre_listening?.length ?? 0;
  const while_ = exercises?.while_listening?.length ?? 0;
  const post = exercises?.post_listening?.length ?? 0;
  const total = pre + while_ + post;
  const PODCAST_MIN = 10;
  if (
    total > 0 &&
    total < PODCAST_MIN &&
    !kinds.some((k) => k.type === 'podcast_exercises')
  )
    kinds.push({
      type: 'podcast_exercises',
      pre,
      while_,
      post,
      required: PODCAST_MIN,
    });
}

function classifyPatchableErrors(
  pass: ContentPass,
  errors: string[],
  parsed: unknown,
  _moduleSpec: ModuleSpec,
  pass1Output?: unknown,
): PatchKind[] {
  const kinds: PatchKind[] = [];
  const content =
    (parsed as { content?: Record<string, unknown> }).content ?? {};
  if (pass === 'lesson') classifyLessonPatchKinds(errors, content, kinds);
  else if (pass === 'reading')
    classifyReadingPatchKinds(errors, content, pass1Output ?? {}, kinds);
  else if (pass === 'podcast') classifyPodcastPatchKinds(content, kinds);
  return kinds;
}

function buildLessonGrammarPatchPart(
  k: Extract<LessonPatchKind, { type: 'lesson_grammar_terminology' }>,
  content: Record<string, unknown>,
): string {
  const forbidden =
    'present perfect, past simple, conditional, subjunctive, gerund, infinitive, conjugation, declension';
  const payload: Record<string, unknown> = {};
  if (content.sections) payload.sections = content.sections;
  if (content.mistakes) payload.mistakes = content.mistakes;
  if (content.dialogue) payload.dialogue = content.dialogue;
  if (content.variations) payload.variations = content.variations;
  const currentJson = JSON.stringify(payload);
  const maxLen = 40000;
  const truncated =
    currentJson.length > maxLen
      ? `${currentJson.slice(0, maxLen)}...[truncated]`
      : currentJson;
  return [
    `FIX GRAMMAR TERMINOLOGY: The lesson was rejected because the word "${k.detectedTerm}" (grammar terminology) was found. Grammar must be invisible to the learner.`,
    `Replace "${k.detectedTerm}" and any of these words with plain language: ${forbidden}.`,
    `Return a JSON object with one or more keys: "sections", "mistakes", "dialogue", "variations". For each key you include, provide the FULL value (same structure) with all grammar terminology removed from every text field.`,
    `Current content (fix and return the keys that need changes):`,
    truncated,
  ].join('\n\n');
}

function buildLessonChunkCountPatchPart(
  k: Extract<LessonPatchKind, { type: 'lesson_chunk_count' }>,
  content: Record<string, unknown>,
  moduleSpec: ModuleSpec,
): string {
  const chunks =
    (content.chunks as Array<{
      id?: string;
      chunk?: string;
      context?: string;
      textbook_version?: string;
    }>) ?? [];
  const toAdd = k.required - k.currentCount;
  const theme = moduleSpec.situationalTheme ?? moduleSpec.title;
  return [
    `FIX CHUNK COUNT: The lesson has ${k.currentCount} chunks but minimum is ${k.required}.`,
    `Return a JSON object with ONE key "chunks". The value must be an array of at least ${k.required} chunks.`,
    `Copy the existing ${k.currentCount} chunks below as the first elements, then add ${toAdd} NEW chunks in the same format (id, chunk, context, textbook_version). Use ids ch_${String(k.currentCount + 1).padStart(3, '0')} onward. Theme: ${theme}. Target language: ${moduleSpec.targetLanguage}.`,
    `Existing chunks:`,
    JSON.stringify(chunks),
  ].join('\n\n');
}

function buildLessonSpeechMapPatchPart(moduleSpec: ModuleSpec): string {
  const theme = moduleSpec.situationalTheme ?? moduleSpec.title;
  return [
    `FIX SPEECH MAP: The lesson is missing connected speech features (module_speech_map with reductions).`,
    `Return a JSON object with ONE key "module_speech_map". The value must be an object with:`,
    `- "reductions": array of at least 3 items; each item: { "formal": string, "spoken": string, "audio_guide": string, "frequency_in_module": number }. Use reductions appropriate for the target language (e.g. German, French liaison/elision).`,
    `- Optionally: "linking_patterns", "weak_forms", "stress_patterns" (arrays of objects).`,
    `Target language: ${moduleSpec.targetLanguage}. Module theme: ${theme}.`,
  ].join('\n');
}

function buildLessonPatchPart(
  k: LessonPatchKind,
  content: Record<string, unknown>,
  moduleSpec: ModuleSpec,
): string {
  const level = moduleSpec.cefrLevel;
  if (k.type === 'lesson_exercises') {
    const exercises = (content.exercises as unknown[]) ?? [];
    const toAdd = k.required - k.currentCount;
    return [
      `FIX EXERCISES:`,
      `- Current count: ${k.currentCount} exercises`,
      `- Required minimum: ${k.required} exercises for level ${level}`,
      `- You must ADD exactly ${toAdd} NEW exercises`,
      ``,
      `IMPORTANT: Return a JSON object with ONE key "exercises".`,
      `The array MUST contain ALL ${k.currentCount} existing exercises FIRST (copy them exactly, do not modify),`,
      `followed by exactly ${toAdd} NEW exercises.`,
      `Total length of the returned array: ${k.required} or more.`,
      ``,
      `Allowed new exercise types: SITUATION, CHOICE, REORDER, MATCH, TRANSFORM`,
      `Match the structure and difficulty of the existing exercises.`,
      ``,
      `EXISTING EXERCISES (copy these first, then add new ones after):`,
      JSON.stringify(exercises, null, 2),
    ].join('\n');
  }
  if (k.type === 'lesson_section_examples') {
    const sections =
      (content.sections as Array<{
        title?: string;
        content?: { examples?: unknown[] };
      }>) ?? [];
    const sec = sections[k.sectionIndex];
    const examples = sec?.content?.examples ?? [];
    return `FIX SECTION EXAMPLES: Section ${k.sectionIndex + 1} (title: "${k.sectionTitle ?? 'unknown'}") has only ${k.currentCount} example(s); minimum 2. Add 1 more example in the same format (native, context, never_say). Return a JSON object with keys "sectionIndex" (number ${k.sectionIndex}) and "examples" (array of ALL examples for this section: ${k.currentCount} existing + 1 new). Current example(s): ${JSON.stringify(examples)}.`;
  }
  if (k.type === 'lesson_section_count') {
    const sections =
      (content.sections as Array<{
        type?: string;
        title?: string;
        content?: unknown;
      }>) ?? [];
    const conceptTitles = sections
      .filter((s) => s.type === 'CONCEPT')
      .map((s) => s.title ?? '');
    const toAdd = k.required - k.currentCount;
    return [
      `FIX CONCEPT SECTION COUNT: The lesson has ${k.currentCount} CONCEPT sections but minimum for this level is ${k.required}.`,
      `You must ADD exactly ${toAdd} new CONCEPT section(s).`,
      `Return a JSON object with ONE key "sections". The value must be an array of exactly ${toAdd} new section object(s).`,
      `Each section: type "CONCEPT", icon "🧠", title (in target language), content: { intro: { title, text }, examples: [ at least 2 items with native, translation, context, never_say ], cultural_note optional }.`,
      `Use chunks from the lesson; do not duplicate existing section themes. Existing CONCEPT section titles: ${JSON.stringify(conceptTitles)}.`,
    ].join('\n');
  }
  if (k.type === 'lesson_grammar_terminology')
    return buildLessonGrammarPatchPart(k, content);
  if (k.type === 'lesson_chunk_count')
    return buildLessonChunkCountPatchPart(k, content, moduleSpec);
  return buildLessonSpeechMapPatchPart(moduleSpec);
}

function buildReadingPatchPart(
  k: ReadingPatchKind,
  content: Record<string, unknown>,
  context: { pass1Output?: unknown },
  moduleSpec: ModuleSpec,
): string {
  if (k.type === 'reading_chunk_coverage') {
    const pass1 = context.pass1Output as
      | { content?: { chunks?: Array<{ id?: string }> } }
      | undefined;
    const chunkIds = (pass1?.content?.chunks ?? [])
      .map((c) => (c as { id?: string }).id ?? '')
      .filter(Boolean);
    const readingText = content.reading_text as
      | { text?: string; chunks_used?: string[] }
      | undefined;
    const minWords =
      moduleSpec.levelParams?.reading?.word_count?.min ??
      moduleSpec.contentParams?.readingWordCount?.min ??
      400;
    return `FIX CHUNK COVERAGE: Reading text must use at least 60% of lesson chunks (${k.usedCount}/${k.totalChunks} used). Available chunk IDs: ${JSON.stringify(chunkIds)}. Current reading_text excerpt: ${JSON.stringify({ text: (readingText?.text ?? '').slice(0, 300), chunks_used: readingText?.chunks_used })}. Return a JSON object with ONE key "reading_text" whose value is the full reading_text object: { "word_count": number, "text": "...", "chunks_used": ["id1", "id2", ...] }. Weave more chunk IDs into the text naturally and set chunks_used to include at least 60% of the available chunk IDs. IMPORTANT: word_count must be at least ${minWords} (minimum for this level). Do not shorten the text; expand if needed to meet both chunk coverage and word count.`;
  }
  if (k.type === 'reading_word_count') {
    const readingText = content.reading_text as
      | { text?: string; chunks_used?: string[] }
      | undefined;
    return `FIX WORD COUNT: Reading text has ${k.currentWordCount} words but minimum is ${k.minWords}. Return a JSON object with ONE key "reading_text" whose value is the full reading_text object with the SAME chunks_used and the SAME meaning, but with the "text" field expanded (add detail, examples, or dialogue) so that word_count is at least ${k.minWords}. Include "word_count": <actual count>. Current text excerpt: ${JSON.stringify((readingText?.text ?? '').slice(0, 500))}. Current chunks_used: ${JSON.stringify(readingText?.chunks_used)}.`;
  }
  const comp = (content.comprehension as unknown[]) ?? [];
  return `FIX COMPREHENSION COUNT: Must have exactly 10 questions. Current: ${k.currentCount}. Return a JSON object with ONE key "comprehension" whose value is an array of exactly 10 comprehension questions (same format as existing). Current format sample: ${JSON.stringify(comp.slice(0, 1))}.`;
}

function buildPodcastPatchPart(
  k: PodcastPatchKind,
  content: Record<string, unknown>,
): string {
  const ex = content.exercises as
    | {
        pre_listening?: unknown[];
        while_listening?: unknown[];
        post_listening?: unknown[];
      }
    | undefined;
  const currentTotal = k.pre + k.while_ + k.post;
  const toAdd = k.required - currentTotal;
  return `FIX PODCAST EXERCISES: We already have ${currentTotal} exercises. You must generate ONLY ${toAdd} NEW exercises. Return a JSON object with ONE key "exercises" whose value is { "pre_listening": [...], "while_listening": [...], "post_listening": [...] } containing ONLY these ${toAdd} new exercises (distribute them across pre_listening, while_listening, post_listening as you see fit). Do NOT repeat existing exercises. Total new items must be exactly ${toAdd}. Format sample: ${JSON.stringify({ pre_listening: ex?.pre_listening?.slice(0, 1), while_listening: ex?.while_listening?.slice(0, 1), post_listening: ex?.post_listening?.slice(0, 1) })}.`;
}

function buildPatchPart(
  k: PatchKind,
  content: Record<string, unknown>,
  context: { pass1Output?: unknown },
  moduleSpec: ModuleSpec,
): string | null {
  if (k.type.startsWith('lesson_'))
    return buildLessonPatchPart(k as LessonPatchKind, content, moduleSpec);
  if (k.type.startsWith('reading_'))
    return buildReadingPatchPart(
      k as ReadingPatchKind,
      content,
      context,
      moduleSpec,
    );
  if (k.type === 'podcast_exercises') return buildPodcastPatchPart(k, content);
  return null;
}

/** Merge incoming items into current, deduplicating by JSON string. */
function mergeArraysDedup(current: unknown[], incoming: unknown[]): unknown[] {
  const currentSet = new Set(current.map((e) => JSON.stringify(e)));
  const onlyNew = incoming.filter((e) => !currentSet.has(JSON.stringify(e)));
  return [...current, ...onlyNew];
}

/**
 * Extracts a value from a patch response, checking both root level and nested under "content".
 * The model sometimes returns the full module object instead of a flat patch object.
 */
function extractFromPatch<T>(
  patch: Record<string, unknown>,
  key: string,
  guard: (v: unknown) => v is T,
): T | null {
  // Check root level first: { exercises: [...] }
  if (guard(patch[key])) return patch[key];
  // Check nested under content: { content: { exercises: [...] } }
  const nested = patch.content as Record<string, unknown> | undefined;
  if (nested && guard(nested[key])) return nested[key];
  return null;
}

function applyLessonExercisesPatch(
  k: Extract<PatchKind, { type: 'lesson_exercises' }>,
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const incoming = extractFromPatch(patch, 'exercises', Array.isArray);
  if (!incoming) return;

  const current = (content.exercises as unknown[]) ?? [];

  if (incoming.length >= k.required) {
    content.exercises = incoming;
  } else {
    content.exercises = mergeArraysDedup(current, incoming);
  }
}

function applyLessonSectionExamplesPatch(
  k: Extract<PatchKind, { type: 'lesson_section_examples' }>,
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  // sectionIndex may also be nested under content
  let sectionIndex = k.sectionIndex;
  if (typeof patch.sectionIndex === 'number') {
    sectionIndex = patch.sectionIndex;
  } else {
    const nestedSectionIndex = (patch.content as Record<string, unknown>)
      ?.sectionIndex;
    if (typeof nestedSectionIndex === 'number')
      sectionIndex = nestedSectionIndex;
  }

  const incoming = extractFromPatch(patch, 'examples', Array.isArray);
  if (!incoming) return;

  const sections =
    (content.sections as Array<{ content?: { examples?: unknown[] } }>) ?? [];
  if (sectionIndex < 0 || sectionIndex >= sections.length) return;

  sections[sectionIndex].content ??= {};
  const currentExamples =
    (sections[sectionIndex].content as { examples?: unknown[] }).examples ?? [];

  (sections[sectionIndex].content as { examples?: unknown[] }).examples =
    incoming.length >= 2
      ? incoming
      : mergeArraysDedup(currentExamples, incoming);
}

function applyLessonSectionCountPatch(
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const incoming = extractFromPatch(patch, 'sections', Array.isArray);
  if (!incoming || incoming.length === 0) return;
  const current = (content.sections as unknown[]) ?? [];
  content.sections = [...current, ...incoming];
}

function applyLessonGrammarPatch(
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const nested = patch.content as Record<string, unknown> | undefined;
  for (const key of [
    'sections',
    'mistakes',
    'dialogue',
    'variations',
  ] as const) {
    const val = patch[key] ?? nested?.[key];
    if (val !== undefined && val !== null) content[key] = val;
  }
}

function applyLessonChunkCountPatch(
  k: Extract<PatchKind, { type: 'lesson_chunk_count' }>,
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const incoming = extractFromPatch(patch, 'chunks', Array.isArray);
  if (!incoming || incoming.length < k.required) return;
  content.chunks = incoming;
}

function applyLessonSpeechMapPatch(
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const incoming = extractFromPatch(
    patch,
    'module_speech_map',
    (v): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null && !Array.isArray(v),
  );
  const fromContent = (patch.content as Record<string, unknown> | undefined)
    ?.module_speech_map;
  const speechMap: Record<string, unknown> | null =
    incoming ??
    (typeof fromContent === 'object' &&
    fromContent !== null &&
    !Array.isArray(fromContent)
      ? (fromContent as Record<string, unknown>)
      : null);
  if (
    speechMap &&
    Array.isArray(speechMap.reductions) &&
    speechMap.reductions.length > 0
  )
    content.module_speech_map = speechMap;
}

function applyReadingTextPatch(
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const readingText = extractFromPatch(
    patch,
    'reading_text',
    (v): v is object => !!v && typeof v === 'object',
  );
  if (readingText) content.reading_text = readingText;
}

function applyReadingComprehensionPatch(
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  const comprehension = extractFromPatch(patch, 'comprehension', Array.isArray);
  if (comprehension) content.comprehension = comprehension;
}

function applyPodcastExercisesPatch(
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  type PodcastExercisesShape = {
    pre_listening?: unknown[];
    while_listening?: unknown[];
    post_listening?: unknown[];
  };
  const newExercises = extractFromPatch(
    patch,
    'exercises',
    (v): v is PodcastExercisesShape =>
      !!v && typeof v === 'object' && !Array.isArray(v),
  );
  if (!newExercises) return;
  const current = content.exercises as PodcastExercisesShape | undefined;
  content.exercises = {
    pre_listening: [
      ...(current?.pre_listening ?? []),
      ...(newExercises.pre_listening ?? []),
    ],
    while_listening: [
      ...(current?.while_listening ?? []),
      ...(newExercises.while_listening ?? []),
    ],
    post_listening: [
      ...(current?.post_listening ?? []),
      ...(newExercises.post_listening ?? []),
    ],
  };
}

function applyOnePatch(
  k: PatchKind,
  patch: Record<string, unknown>,
  content: Record<string, unknown>,
): void {
  if (k.type === 'lesson_exercises') {
    applyLessonExercisesPatch(k, patch, content);
    return;
  }
  if (k.type === 'lesson_section_examples') {
    applyLessonSectionExamplesPatch(k, patch, content);
    return;
  }
  if (k.type === 'lesson_section_count') {
    applyLessonSectionCountPatch(patch, content);
    return;
  }
  if (k.type === 'lesson_grammar_terminology') {
    applyLessonGrammarPatch(patch, content);
    return;
  }
  if (k.type === 'lesson_chunk_count') {
    applyLessonChunkCountPatch(k, patch, content);
    return;
  }
  if (k.type === 'lesson_speech_map') {
    applyLessonSpeechMapPatch(patch, content);
    return;
  }
  if (k.type === 'reading_chunk_coverage' || k.type === 'reading_word_count') {
    applyReadingTextPatch(patch, content);
    return;
  }
  if (k.type === 'reading_comprehension_count') {
    applyReadingComprehensionPatch(patch, content);
    return;
  }
  if (k.type === 'podcast_exercises') {
    applyPodcastExercisesPatch(patch, content);
  }
}

export interface GenerateModuleContentOutput {
  pass: ContentPass;
  raw: unknown;
  validation: ValidationResult;
  saved?: boolean;
}

export interface IGenerateModuleContentUseCase {
  execute(
    request: GenerationRequest,
    options?: {
      onProgress?: (message: string) => void;
      onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
      saveToDb?: boolean;
    },
  ): Promise<GenerateModuleContentOutput[]>;
}

export class GenerateModuleContentUseCase
  implements IGenerateModuleContentUseCase
{
  constructor(
    private readonly specResolver: IModuleSpecResolver,
    private readonly promptComposer: IPromptComposer,
    private readonly contentGenerator: IContentGeneratorPort,
    private readonly saveLesson: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly saveReading: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly savePodcast: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly saveSpeaking: (
      output: unknown,
      spec: ModuleSpec,
    ) => Promise<void>,
    private readonly loadLessonContext?: (
      spec: ModuleSpec,
    ) => Promise<{ content: Record<string, unknown> } | null>,
  ) {}

  async execute(
    request: GenerationRequest,
    options?: {
      onProgress?: (message: string) => void;
      onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
      saveToDb?: boolean;
    },
  ): Promise<GenerateModuleContentOutput[]> {
    const orderedPasses = this.orderPasses(request.passesToRun);
    if (orderedPasses.length === 0) return [];

    options?.onProgress?.('Resolving module spec...');
    const moduleSpec = await this.specResolver.resolve(request);

    const results: GenerateModuleContentOutput[] = [];
    let previousOutputs: PreviousPassOutputs = {};
    let pass1Output: unknown = null;
    let pass2Output: unknown = null;
    let pass3Output: unknown = null;

    const needsLessonContext =
      (orderedPasses.includes('reading') ||
        orderedPasses.includes('podcast') ||
        orderedPasses.includes('speaking')) &&
      !orderedPasses.includes('lesson');
    if (needsLessonContext && this.loadLessonContext) {
      const loaded = await this.loadLessonContext(moduleSpec);
      if (loaded) {
        pass1Output = loaded;
        previousOutputs = extractPass1Context(
          loaded as Parameters<typeof extractPass1Context>[0],
        );
        const chunkCount = (loaded.content?.chunks as unknown[])?.length ?? 0;
        options?.onProgress?.(
          `Loaded lesson context from DB (${chunkCount} chunks) for chunk coverage.`,
        );
      }
    }

    for (const pass of orderedPasses) {
      const outcome = await this.runOnePass(
        pass,
        moduleSpec,
        previousOutputs,
        pass1Output,
        pass2Output,
        pass3Output,
        request,
        options,
      );
      results.push(outcome.result);
      pass1Output = outcome.pass1Output;
      pass2Output = outcome.pass2Output;
      pass3Output = outcome.pass3Output;
      previousOutputs = outcome.previousOutputs;

      if (!outcome.validationPassed) {
        options?.onProgress?.(
          `Skipping subsequent passes because ${pass} failed validation.`,
        );
        break;
      }
    }
    return results;
  }

  private async runOnePass(
    pass: ContentPass,
    moduleSpec: ModuleSpec,
    previousOutputs: PreviousPassOutputs,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
    request: GenerationRequest,
    options:
      | {
          onProgress?: (message: string) => void;
          onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
          saveToDb?: boolean;
        }
      | undefined,
  ): Promise<{
    result: GenerateModuleContentOutput;
    pass1Output: unknown;
    pass2Output: unknown;
    pass3Output: unknown;
    previousOutputs: PreviousPassOutputs;
    validationPassed: boolean;
  }> {
    options?.onProgress?.(`Composing prompt for ${pass}...`);
    const composed = await this.promptComposer.compose(
      pass,
      moduleSpec,
      Object.keys(previousOutputs).length > 0 ? previousOutputs : undefined,
    );

    const { parsed, validation } = await this.runGenerationWithRetries(
      pass,
      composed,
      moduleSpec,
      options,
      pass1Output,
      pass2Output,
      pass3Output,
    );

    const result: GenerateModuleContentOutput = {
      pass,
      raw: parsed,
      validation,
    };
    if (validation.warnings.length > 0) {
      options?.onProgress?.(
        `Warnings for ${pass}: ${validation.warnings.join('; ')}`,
      );
    }

    const {
      pass1Output: nextP1,
      pass2Output: nextP2,
      pass3Output: nextP3,
      previousOutputs: nextPrevious,
    } = await this.handleSaveAndContext(
      pass,
      parsed,
      validation,
      result,
      request,
      options,
      moduleSpec,
      pass1Output,
      pass2Output,
      pass3Output,
      previousOutputs,
    );

    return {
      result,
      pass1Output: nextP1,
      pass2Output: nextP2,
      pass3Output: nextP3,
      previousOutputs: nextPrevious,
      validationPassed: validation.passed,
    };
  }

  /** Single full generation; on failure we fix with cheap patch requests (add what's missing). */
  private static readonly MAX_FULL_ATTEMPTS = 1;
  /** Patch attempts: small prompts that fix only the failing part; merge and re-validate. */
  private static readonly MAX_PATCH_ATTEMPTS = 5;

  private async runOneGenerationAttempt(
    pass: ContentPass,
    currentComposed: Awaited<ReturnType<IPromptComposer['compose']>>,
    moduleSpec: ModuleSpec,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
  ): Promise<{ parsed: unknown; validation: ValidationResult } | null> {
    const lessonOptions =
      pass === 'lesson'
        ? {
            cefrLevel: moduleSpec.cefrLevel,
            targetLanguage: moduleSpec.targetLanguage,
            nativeLanguage: moduleSpec.nativeLanguage,
          }
        : undefined;
    const rawJson = await this.contentGenerator.generate(
      currentComposed,
      pass,
      lessonOptions,
    );
    const parseResult = this.parseJsonOrNull(rawJson);
    if (parseResult === null) return null;
    const parsed =
      pass === 'lesson' ? normalizeLessonOutput(parseResult) : parseResult;
    const validation = this.validatePass(pass, parsed, moduleSpec, {
      pass1Output,
      pass2Output,
      pass3Output,
    });
    return { parsed, validation };
  }

  private async runFullGenerationPhase(
    pass: ContentPass,
    composed: Awaited<ReturnType<IPromptComposer['compose']>>,
    moduleSpec: ModuleSpec,
    options: { onProgress?: (message: string) => void } | undefined,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
  ): Promise<
    | { done: true; parsed: unknown; validation: ValidationResult }
    | { done: false; parsed: unknown; lastValidation: ValidationResult }
  > {
    let parsed: unknown = null;
    let lastValidation: ValidationResult = {
      passed: false,
      errors: ['Not attempted'],
      warnings: [],
    };
    const maxFull = GenerateModuleContentUseCase.MAX_FULL_ATTEMPTS;

    for (let attempt = 0; attempt < maxFull; attempt++) {
      if (attempt > 0) {
        options?.onProgress?.(
          `Full retry ${attempt}/${maxFull - 1} for ${pass} (errors will be included in prompt)...`,
        );
      }
      const currentComposed = this.buildComposedForAttempt(
        composed,
        attempt,
        lastValidation,
      );
      options?.onProgress?.(
        `Calling LLM for ${pass} (full generation ${attempt + 1}/${maxFull})...`,
      );
      const result = await this.runOneGenerationAttempt(
        pass,
        currentComposed,
        moduleSpec,
        pass1Output,
        pass2Output,
        pass3Output,
      );

      if (result === null) {
        options?.onProgress?.(
          `Invalid JSON from LLM for ${pass}, attempt ${attempt + 1}`,
        );
        if (attempt === maxFull - 1) {
          throw new Error(
            `Invalid JSON from LLM for pass ${pass} after ${maxFull} full attempts`,
          );
        }
        continue;
      }
      parsed = result.parsed;
      lastValidation = result.validation;
      if (lastValidation.passed) {
        if (attempt > 0) {
          options?.onProgress?.(
            `${pass} passed validation on full retry ${attempt + 1}.`,
          );
        }
        return { done: true, parsed, validation: lastValidation };
      }
      options?.onProgress?.(
        `Validation failed for ${pass} (attempt ${attempt + 1}): ${lastValidation.errors.join('; ')}`,
      );
    }
    return { done: false, parsed: parsed ?? {}, lastValidation };
  }

  private logPatchResponseKeys(
    pass: ContentPass,
    patchAttempt: number,
    _maxPatch: number,
    patchJson: Record<string, unknown>,
    onProgress?: (message: string) => void,
  ): void {
    const patchKeys = Object.keys(patchJson).join(', ');
    if (pass === 'lesson' || pass === 'podcast') {
      const rootExercises = Array.isArray(patchJson.exercises)
        ? patchJson.exercises.length
        : null;
      const nested = patchJson.content as Record<string, unknown> | undefined;
      const nestedExercises =
        nested && Array.isArray(nested.exercises)
          ? (nested.exercises as unknown[]).length
          : null;
      onProgress?.(
        `Patch ${patchAttempt + 1} response keys: ${patchKeys} | exercises at root: ${rootExercises ?? 'N/A'} | exercises in content: ${nestedExercises ?? 'N/A'}`,
      );
    } else {
      onProgress?.(`Patch ${patchAttempt + 1} response keys: ${patchKeys}`);
    }
  }

  private async runOnePatchAttempt(
    pass: ContentPass,
    patchAttempt: number,
    maxPatch: number,
    moduleSpec: ModuleSpec,
    parsed: unknown,
    patchKinds: PatchKind[],
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
    options: { onProgress?: (message: string) => void } | undefined,
  ): Promise<{ merged: unknown; validation: ValidationResult } | null> {
    const patchPrompt = this.buildPatchPrompt(
      pass,
      moduleSpec,
      parsed,
      patchKinds,
      {
        pass1Output,
      },
    );
    options?.onProgress?.(
      `Patch attempt ${patchAttempt + 1}/${maxPatch} for ${pass}...`,
    );
    const rawPatch = await this.contentGenerator.generate(
      patchPrompt,
      pass,
      pass === 'lesson'
        ? { cefrLevel: moduleSpec.cefrLevel, isLessonPatch: true }
        : undefined,
    );
    const patchJson = this.parseJsonOrNull(rawPatch);
    if (patchJson === null) {
      options?.onProgress?.(`Invalid JSON from patch response for ${pass}.`);
      return null;
    }
    const patchRecord = patchJson as Record<string, unknown>;
    this.logPatchResponseKeys(
      pass,
      patchAttempt,
      maxPatch,
      patchRecord,
      options?.onProgress,
    );
    const merged = this.applyPatch(pass, parsed, patchRecord, patchKinds);
    if (merged === null) {
      options?.onProgress?.(`Patch merge failed for ${pass}.`);
      return null;
    }
    const validation = this.validatePass(pass, merged, moduleSpec, {
      pass1Output,
      pass2Output,
      pass3Output,
    });
    return { merged, validation };
  }

  private async runPatchPhase(
    pass: ContentPass,
    moduleSpec: ModuleSpec,
    parsed: unknown,
    lastValidation: ValidationResult,
    options: { onProgress?: (message: string) => void } | undefined,
    passOutputs: {
      pass1Output: unknown;
      pass2Output: unknown;
      pass3Output: unknown;
    },
  ): Promise<{ parsed: unknown; validation: ValidationResult }> {
    const { pass1Output, pass2Output, pass3Output } = passOutputs;
    const maxPatch = GenerateModuleContentUseCase.MAX_PATCH_ATTEMPTS;
    const patchKinds = classifyPatchableErrors(
      pass,
      lastValidation.errors,
      parsed,
      moduleSpec,
      pass1Output,
    );
    if (patchKinds.length === 0) {
      options?.onProgress?.(
        `WARNING: ${pass} failed validation after full attempts; no patchable errors. Skipping save.`,
      );
      return { parsed, validation: lastValidation };
    }
    options?.onProgress?.(
      `Trying patch fixes (${patchKinds.length} issue(s)) to avoid full regeneration...`,
    );

    let currentParsed = parsed;
    for (let patchAttempt = 0; patchAttempt < maxPatch; patchAttempt++) {
      const result = await this.runOnePatchAttempt(
        pass,
        patchAttempt,
        maxPatch,
        moduleSpec,
        currentParsed,
        patchKinds,
        pass1Output,
        pass2Output,
        pass3Output,
        options,
      );
      if (result === null) continue;
      if (result.validation.passed) {
        options?.onProgress?.(
          `${pass} passed validation after patch ${patchAttempt + 1}.`,
        );
        return { parsed: result.merged, validation: result.validation };
      }
      options?.onProgress?.(
        `Patch ${patchAttempt + 1}: validation still failing: ${result.validation.errors.join('; ')}`,
      );
      currentParsed = result.merged;
      patchKinds.length = 0;
      for (const k of classifyPatchableErrors(
        pass,
        result.validation.errors,
        result.merged,
        moduleSpec,
        pass1Output,
      ))
        patchKinds.push(k);
    }
    options?.onProgress?.(
      `WARNING: ${pass} failed validation after full + patch attempts. Skipping save.`,
    );
    return { parsed: currentParsed, validation: lastValidation };
  }

  private async runGenerationWithRetries(
    pass: ContentPass,
    composed: Awaited<ReturnType<IPromptComposer['compose']>>,
    moduleSpec: ModuleSpec,
    options: { onProgress?: (message: string) => void } | undefined,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
  ): Promise<{ parsed: unknown; validation: ValidationResult }> {
    const fullResult = await this.runFullGenerationPhase(
      pass,
      composed,
      moduleSpec,
      options,
      pass1Output,
      pass2Output,
      pass3Output,
    );
    if (fullResult.done)
      return { parsed: fullResult.parsed, validation: fullResult.validation };
    return this.runPatchPhase(
      pass,
      moduleSpec,
      fullResult.parsed,
      fullResult.lastValidation,
      options,
      { pass1Output, pass2Output, pass3Output },
    );
  }

  private buildPatchPrompt(
    _pass: ContentPass,
    moduleSpec: ModuleSpec,
    parsed: unknown,
    patchKinds: PatchKind[],
    context: { pass1Output?: unknown },
  ): { systemPrompt: string; userMessage: string } {
    const level = moduleSpec.cefrLevel;
    const systemPrompt = `You are a content fixer. Return ONLY valid JSON with the exact keys requested. No markdown, no explanation. Language: ${moduleSpec.targetLanguage}. Level: ${level}. Module theme: ${moduleSpec.situationalTheme ?? moduleSpec.title}.`;
    const content =
      (parsed as { content?: Record<string, unknown> }).content ?? {};
    const parts = patchKinds
      .map((k) => buildPatchPart(k, content, context, moduleSpec))
      .filter((p): p is string => p !== null);
    const userMessage =
      parts.length > 0
        ? parts.join('\n\n')
        : 'Return the minimal JSON fix as described above.';
    return { systemPrompt, userMessage };
  }

  /** Merges patch JSON into a deep clone of parsed. Returns null if merge fails. */
  private applyPatch(
    _pass: ContentPass,
    parsed: unknown,
    patchJson: unknown,
    patchKinds: PatchKind[],
  ): unknown | null {
    const patch = patchJson as Record<string, unknown>;
    try {
      const cloned = structuredClone(parsed) as {
        content?: Record<string, unknown>;
      };
      const content = cloned.content ?? {};
      for (const k of patchKinds) applyOnePatch(k, patch, content);
      cloned.content = content;
      return cloned;
    } catch {
      return null;
    }
  }

  private buildComposedForAttempt(
    composed: Awaited<ReturnType<IPromptComposer['compose']>>,
    attempt: number,
    lastValidation: ValidationResult,
  ): Awaited<ReturnType<IPromptComposer['compose']>> {
    if (attempt === 0 || lastValidation.errors.length === 0) return composed;
    const errorsText = lastValidation.errors.map((e) => `- ${e}`).join('\n');
    const chunkError = lastValidation.errors.some(
      (e) =>
        e.includes('Chunk coverage') ||
        e.includes('chunks used') ||
        e.includes('chunks_used'),
    );
    const exerciseError = lastValidation.errors.some(
      (e) =>
        e.includes('exercises') &&
        (e.includes('minimum') || e.includes('Only')),
    );
    let fixInstructions = '';
    if (chunkError) {
      fixInstructions +=
        '\n\nFIX FOR CHUNK COVERAGE: Before writing the reading text, list at least the required number of chunk IDs from the MANDATORY CHUNKS list. Weave them into the narrative. Set reading_text.chunks_used to that full list. Count: chunks_used.length MUST be >= the minimum_chunks_required stated above.';
    }
    if (exerciseError) {
      fixInstructions +=
        '\n\nFIX FOR EXERCISE COUNT: Count the exercises array. If it has fewer than the minimum required for this level, add more exercises (SITUATION, CHOICE, REORDER, MATCH, or TRANSFORM) until you have at least the required number. Then return the JSON.';
    }
    const retryAddendum = `\n\n## RETRY — PREVIOUS ATTEMPT REJECTED\nThe previous generation was rejected. You must fix these issues in this attempt:\n${errorsText}${fixInstructions}\n\nDo not return output that fails the same validation again.`;
    return {
      systemPrompt: composed.systemPrompt,
      userMessage: composed.userMessage + retryAddendum,
    };
  }

  private parseJsonOrNull(raw: string): unknown | null {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  private async handleSaveAndContext(
    pass: ContentPass,
    parsed: unknown,
    validation: ValidationResult,
    result: GenerateModuleContentOutput,
    request: GenerationRequest,
    options:
      | {
          onProgress?: (message: string) => void;
          onReview?: (pass: ContentPass, output: unknown) => Promise<boolean>;
          saveToDb?: boolean;
        }
      | undefined,
    moduleSpec: ModuleSpec,
    pass1Output: unknown,
    pass2Output: unknown,
    pass3Output: unknown,
    previousOutputs: PreviousPassOutputs,
  ): Promise<{
    pass1Output: unknown;
    pass2Output: unknown;
    pass3Output: unknown;
    previousOutputs: PreviousPassOutputs;
  }> {
    const shouldSave =
      options?.saveToDb !== false && !request.reviewMode && validation.passed;

    if (request.reviewMode && options?.onReview) {
      const approved = await options.onReview(pass, parsed);
      if (approved && validation.passed) {
        await this.savePass(pass, parsed, moduleSpec);
        result.saved = true;
      }
    } else if (shouldSave) {
      if (pass === 'podcast') {
        options?.onProgress?.('Generating podcast audio (TTS)...');
      }
      await this.savePass(pass, parsed, moduleSpec);
      result.saved = true;
    }

    let nextP1 = pass1Output;
    let nextP2 = pass2Output;
    let nextP3 = pass3Output;
    let nextPrevious = previousOutputs;

    if (validation.passed) {
      if (pass === 'lesson') nextP1 = parsed;
      else if (pass === 'reading') nextP2 = parsed;
      else if (pass === 'podcast') nextP3 = parsed;
      nextPrevious = this.buildPreviousOutputs(
        pass,
        previousOutputs,
        nextP1,
        nextP2,
        nextP3,
      );
      const chunkCount =
        (nextPrevious.from_pass_1 as { chunks_taught?: unknown[] })
          ?.chunks_taught?.length ?? 0;
      options?.onProgress?.(
        `Context updated: ${chunkCount} chunks available for next pass`,
      );
    }

    return {
      pass1Output: nextP1,
      pass2Output: nextP2,
      pass3Output: nextP3,
      previousOutputs: nextPrevious,
    };
  }

  private orderPasses(passes: ContentPass[]): ContentPass[] {
    return PASS_ORDER.filter((p) => passes.includes(p));
  }

  private validatePass(
    pass: ContentPass,
    output: unknown,
    moduleSpec: ModuleSpec,
    context: {
      pass1Output: unknown;
      pass2Output: unknown;
      pass3Output: unknown;
    },
  ): ValidationResult {
    const out = output as { content?: Record<string, unknown> };
    switch (pass) {
      case 'lesson':
        return validateLessonOutput(out, moduleSpec);
      case 'reading':
        return validateReadingOutput(
          out,
          moduleSpec,
          (context.pass1Output as { content?: { chunks?: unknown[] } }) ?? {},
        );
      case 'podcast':
        return validatePodcastOutput(out, moduleSpec);
      case 'speaking':
        return validateSpeakingOutput(out, moduleSpec);
      default:
        return { passed: true, errors: [], warnings: [] };
    }
  }

  private buildPreviousOutputs(
    lastPass: ContentPass,
    current: PreviousPassOutputs,
    p1: unknown,
    p2: unknown,
    p3: unknown,
  ): PreviousPassOutputs {
    if (lastPass === 'lesson' && p1) {
      return extractPass1Context(
        p1 as Parameters<typeof extractPass1Context>[0],
      );
    }
    if (lastPass === 'reading' && p1 && p2) {
      return extractPass2Context(
        p2 as Parameters<typeof extractPass2Context>[0],
        p1 as Parameters<typeof extractPass2Context>[1],
      );
    }
    if (lastPass === 'podcast' && p1 && p2 && p3) {
      const c1 = extractPass1Context(
        p1 as Parameters<typeof extractPass1Context>[0],
      );
      const c2 = extractPass2Context(
        p2 as Parameters<typeof extractPass2Context>[0],
        p1 as Parameters<typeof extractPass2Context>[1],
      );
      return extractPass3Context(
        p3 as Parameters<typeof extractPass3Context>[0],
        c1,
        c2,
      );
    }
    return current;
  }

  private async savePass(
    pass: ContentPass,
    output: unknown,
    spec: ModuleSpec,
  ): Promise<void> {
    switch (pass) {
      case 'lesson':
        await this.saveLesson(output, spec);
        break;
      case 'reading':
        await this.saveReading(output, spec);
        break;
      case 'podcast':
        await this.savePodcast(output, spec);
        break;
      case 'speaking':
        await this.saveSpeaking(output, spec);
        break;
    }
  }
}
