import type { ModuleSpec } from '@/features/content-generation/domain/types/generation-request.types';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

const GRAMMAR_TERMS = [
  'present perfect',
  'past simple',
  'conditional',
  'subjunctive',
  'gerund',
  'infinitive',
  'conjugation',
  'declension',
];

/** Exported so prompt-composer can inject level-specific minimums into lesson prompt. */
export const MIN_SECTIONS_BY_LEVEL: Record<string, number> = {
  A1: 8,
  A2: 10,
  B1: 10,
  B2: 10,
  C1: 12,
  C2: 14,
};

/** Exported so prompt-composer can inject level-specific minimums into lesson prompt. */
export const MIN_EXERCISES_BY_LEVEL: Record<string, number> = {
  A1: 10,
  A2: 10,
  B1: 10,
  B2: 10,
  C1: 10,
  C2: 10,
};

function validateChunkCount(
  content: Record<string, unknown>,
  moduleSpec: ModuleSpec,
  errors: string[],
): number {
  const chunkCount =
    (content.chunks as unknown[])?.length ??
    (content.high_frequency_chunks as unknown[])?.length ??
    0;
  const minChunks = (moduleSpec.contentParams?.chunk_count ??
    moduleSpec.contentParams?.chunkCount) as
    | { min: number; max: number }
    | undefined;
  if (minChunks && chunkCount < minChunks.min) {
    errors.push(`Chunk count ${chunkCount} below minimum ${minChunks.min}`);
  }
  return chunkCount;
}

function validateGrammarTerms(
  content: Record<string, unknown>,
  errors: string[],
): void {
  const contentForGrammarCheck = { ...content };
  delete (contentForGrammarCheck as Record<string, unknown>).grammar_patterns;
  const textContent = JSON.stringify(contentForGrammarCheck).toLowerCase();
  for (const term of GRAMMAR_TERMS) {
    if (textContent.includes(term)) {
      errors.push(
        `Grammar terminology detected: "${term}" — grammar must be invisible`,
      );
    }
  }
}

function validateSpeechMap(
  content: Record<string, unknown>,
  errors: string[],
): void {
  const speechMap = (content.speech_map ?? content.module_speech_map) as
    | { reductions?: unknown[] }
    | undefined;
  if (!speechMap || !(speechMap.reductions?.length ?? 0)) {
    errors.push(
      'No connected speech features found — every module must include speech mapping',
    );
  }
}

function validateAdaptiveAndCognitive(
  content: Record<string, unknown>,
  errors: string[],
  warnings: string[],
): void {
  if (!content.adaptive_metadata) {
    errors.push('Missing adaptive metadata');
  }
  const cognitive = content.cognitive_reinforcement as
    | { identity_shift?: unknown }
    | undefined;
  if (!cognitive?.identity_shift) {
    warnings.push('Missing identity shift definition');
  }
}

function validateMistakesL1(
  content: Record<string, unknown>,
  moduleSpec: ModuleSpec,
  warnings: string[],
): void {
  const mistakes = content.mistakes as
    | Array<{ why_wrong?: string }>
    | undefined;
  if (!mistakes?.length) return;
  const nativeEqualsTarget =
    moduleSpec.nativeLanguage === moduleSpec.targetLanguage;
  if (nativeEqualsTarget) return;
  const nativeLang = moduleSpec.nativeLanguage;
  const genericCount = mistakes.filter(
    (m) =>
      !(m.why_wrong?.includes(nativeLang) ?? false) &&
      !(m.why_wrong?.toLowerCase().includes('speakers of') ?? false),
  ).length;
  if (genericCount > mistakes.length * 0.5) {
    warnings.push(
      'More than 50% of mistakes appear generic — should be L1-specific',
    );
  }
}

function validateConceptSections(
  content: Record<string, unknown>,
  moduleSpec: ModuleSpec,
  chunkCount: number,
  errors: string[],
  warnings: string[],
): void {
  const sections =
    (content.sections as Array<{
      type?: string;
      content?: { examples?: unknown[] };
    }>) ?? [];
  const conceptSections = sections.filter((s) => s.type === 'CONCEPT');
  const levelKey = (moduleSpec.cefrLevel ?? 'A1').toString().toUpperCase();
  const minSections = MIN_SECTIONS_BY_LEVEL[levelKey] ?? 8;

  if (conceptSections.length < minSections) {
    errors.push(
      `Only ${conceptSections.length} CONCEPT sections — minimum ${minSections} required for ${levelKey}`,
    );
  }

  const totalExamples = conceptSections.reduce((sum, s) => {
    return sum + ((s.content?.examples as unknown[])?.length ?? 0);
  }, 0);
  if (chunkCount > 0 && totalExamples < chunkCount * 0.8) {
    warnings.push(
      `Only ${totalExamples} examples across ${conceptSections.length} sections — should cover at least 80% of ${chunkCount} chunks`,
    );
  }

  conceptSections.forEach((section, i) => {
    const exampleCount = (section.content?.examples as unknown[])?.length ?? 0;
    if (exampleCount < 2) {
      warnings.push(
        `Section ${i + 1} has only ${exampleCount} example(s) — minimum 2 per section`,
      );
    }
  });
}

function validateExercisesCount(
  content: Record<string, unknown>,
  moduleSpec: ModuleSpec,
  errors: string[],
): void {
  const exercises = (content.exercises as unknown[]) ?? [];
  const levelKey = (moduleSpec.cefrLevel ?? 'A1').toString().toUpperCase();
  const minExercises = MIN_EXERCISES_BY_LEVEL[levelKey] ?? 10;
  if (exercises.length < minExercises) {
    errors.push(
      `Only ${exercises.length} exercises — minimum ${minExercises} required for ${levelKey}`,
    );
  }
}

export function validateLessonOutput(
  output: { content?: Record<string, unknown> },
  moduleSpec: ModuleSpec,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = output.content ?? {};

  const chunkCount = validateChunkCount(content, moduleSpec, errors);
  validateGrammarTerms(content, errors);
  validateSpeechMap(content, errors);
  validateAdaptiveAndCognitive(content, errors, warnings);
  validateMistakesL1(content, moduleSpec, warnings);
  validateConceptSections(content, moduleSpec, chunkCount, errors, warnings);
  validateExercisesCount(content, moduleSpec, errors);

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateReadingOutput(
  output: { content?: Record<string, unknown> },
  moduleSpec: ModuleSpec,
  pass1Output: { content?: { chunks?: unknown[] } },
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = output.content ?? {};
  const readingText = content.reading_text as
    | { word_count?: number; chunks_used?: string[] }
    | undefined;

  const totalChunks = pass1Output.content?.chunks?.length ?? 0;
  if (totalChunks === 0) {
    warnings.push(
      'No lesson chunks available for coverage check — was lesson pass run first?',
    );
  } else {
    const usedChunks = readingText?.chunks_used?.length ?? 0;
    const coverage = (usedChunks / totalChunks) * 100;
    if (coverage < 60) {
      errors.push(
        `Chunk coverage ${coverage.toFixed(0)}% below minimum 60% (${usedChunks}/${totalChunks} chunks used)`,
      );
    }
    if (coverage > 95) {
      warnings.push(
        `Chunk coverage ${coverage.toFixed(0)}% seems forced — check naturalness`,
      );
    }
  }

  const wordCount = readingText?.word_count ?? 0;
  const minWords = (moduleSpec.contentParams?.readingWordCount ??
    moduleSpec.levelParams?.reading?.word_count) as
    | { min: number; max: number }
    | undefined;
  if (minWords && wordCount < minWords.min) {
    errors.push(`Word count ${wordCount} below minimum ${minWords.min}`);
  }

  const questions = (content.comprehension as Array<{ tests?: string }>) ?? [];
  const questionCount = questions.length;
  if (questionCount !== 10) {
    errors.push(
      `Reading comprehension must have exactly 10 questions (got ${questionCount}). See prompts/03-PASS-READING or passes/03-PASS-READING.`,
    );
  }
  const hasInference = questions.some((q) =>
    (q.tests ?? '').toLowerCase().includes('inference'),
  );
  if (!hasInference && questions.length > 0) {
    warnings.push('No inference questions — add at least 1-2');
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

const PODCAST_MIN_EXERCISES = 10;

export function validatePodcastOutput(
  output: { content?: Record<string, unknown> },
  _moduleSpec: ModuleSpec,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = output.content ?? {};

  if (!content.episode) {
    errors.push('Missing episode metadata');
  }
  if (!content.script) {
    errors.push('Missing script');
  }
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
  if (total > 0 && total < PODCAST_MIN_EXERCISES) {
    errors.push(
      `Podcast must have exactly ${PODCAST_MIN_EXERCISES} comprehension exercises (got ${total}). See prompts/04-PASS-PODCAST or passes/04-PASS-PODCAST.`,
    );
  }
  if (!(exercises?.post_listening?.length ?? 0)) {
    warnings.push('No post-listening exercises');
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateSpeakingOutput(
  output: { content?: Record<string, unknown> },
  _moduleSpec: ModuleSpec,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const content = output.content ?? {};

  const scenarios = content.scenarios as unknown[] | undefined;
  if (!(scenarios?.length ?? 0)) {
    errors.push('No speaking scenarios');
  }
  if (!content.evaluation) {
    warnings.push('Missing evaluation criteria');
  }
  if (!content.fluency_gym) {
    warnings.push('Missing fluency gym drills');
  }
  const fixationExercises = content.fixation_exercises as unknown[] | undefined;
  if (!(fixationExercises?.length ?? 0)) {
    warnings.push(
      'No fixation exercises — learners will see no exercises after the conversation',
    );
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}
