import type {
  IPromptComposer,
  PreviousPassOutputs,
} from '@/features/content-generation/domain/ports/prompt-composer.interface';
import type {
  ComposedPrompt,
  ContentPass,
  ModuleSpec,
} from '@/features/content-generation/domain/types/generation-request.types';
import {
  MIN_EXERCISES_BY_LEVEL,
  MIN_SECTIONS_BY_LEVEL,
} from '../utils/content-validator';
import {
  BASE_SYSTEM_PATH,
  loadPromptFile,
  PASS_PROMPT_PATHS,
} from '../utils/prompt-loader';
import { injectVariables } from '../utils/variable-injector';

/**
 * Composes prompts from /prompts files: base system + level config + pass-specific + previous pass context.
 * Injects explicit chunk lists for reading/podcast/speaking so the LLM reliably uses lesson chunks.
 */
export class PromptComposerService implements IPromptComposer {
  async compose(
    pass: ContentPass,
    moduleSpec: ModuleSpec,
    previousPassOutputs?: PreviousPassOutputs,
  ): Promise<ComposedPrompt> {
    const basePrompt = await loadPromptFile(BASE_SYSTEM_PATH);
    const levelParams = moduleSpec.levelParams;

    const chunkCount =
      moduleSpec.contentParams?.chunk_count ??
      moduleSpec.contentParams?.chunkCount;
    const readingWordCount =
      moduleSpec.levelParams.reading?.word_count ??
      moduleSpec.contentParams?.readingWordCount;
    const variationCount =
      moduleSpec.levelParams.exercises?.variation_count ??
      moduleSpec.contentParams?.variationCount;

    const chunkRange = chunkCount as { min: number; max: number } | undefined;
    const cefr = moduleSpec.cefrLevel ?? 'A1';
    const minExercises = MIN_EXERCISES_BY_LEVEL[cefr] ?? 10;
    const minSections = MIN_SECTIONS_BY_LEVEL[cefr] ?? 8;
    const nativeEqualsTarget =
      moduleSpec.nativeLanguage === moduleSpec.targetLanguage;
    const immersionModeNote = nativeEqualsTarget
      ? '- **Immersion mode:** When nativeLanguage equals targetLanguage, all support text (translations, prompt_native, scenario_native, vocabulary definitions, mistake explanations) must be in the target language. For mistakes, describe common learner errors and explain in the target language; why_wrong need not reference a specific L1.'
      : '';
    const variables: Record<string, unknown> = {
      ...moduleSpec,
      nativeEqualsTarget,
      immersionModeNote,
      specificInstructions: moduleSpec.specificInstructions ?? '',
      targetLanguage: moduleSpec.targetLanguage,
      nativeLanguage: moduleSpec.nativeLanguage,
      cefrLevel: moduleSpec.cefrLevel,
      moduleId: moduleSpec.moduleId,
      title: moduleSpec.title,
      situationalTheme: moduleSpec.situationalTheme,
      readingFormat: moduleSpec.readingFormat,
      coreModuleNumber: moduleSpec.coreModuleNumber ?? '',
      chunkCount: chunkRange ? `${chunkRange.min}-${chunkRange.max}` : '15-20',
      chunkMin: chunkRange?.min ?? 15,
      chunkMax: chunkRange?.max ?? 20,
      min: readingWordCount?.min ?? 100,
      max: readingWordCount?.max ?? 300,
      variationCount: variationCount
        ? `${(variationCount as { min: number; max: number }).min}-${(variationCount as { min: number; max: number }).max}`
        : '3-5',
      minExercises,
      minSections,
      ...(previousPassOutputs ?? {}),
    };

    const systemPrompt = injectVariables(basePrompt, variables);

    const passPath = PASS_PROMPT_PATHS[pass];
    const passPrompt = await loadPromptFile(passPath);
    const injectedPassPrompt = injectVariables(passPrompt, variables);

    let contextBlock = '';
    let chunkTargetBanner = '';
    if (previousPassOutputs && pass !== 'lesson') {
      contextBlock = this.buildExplicitContext(pass, previousPassOutputs);
      chunkTargetBanner = this.buildChunkTargetBanner(
        pass,
        previousPassOutputs,
      );
    }

    const userMessage = [
      chunkTargetBanner,
      `## LEVEL CONFIGURATION\n${JSON.stringify(levelParams, null, 2)}`,
      contextBlock,
      injectedPassPrompt,
    ]
      .filter(Boolean)
      .join('\n\n');

    return { systemPrompt, userMessage };
  }

  /**
   * Builds a banner with exact chunk target so the LLM sees the required
   * minimum first. Placed at the very top of the user message to reduce failures.
   */
  private buildChunkTargetBanner(
    pass: ContentPass,
    outputs: PreviousPassOutputs,
  ): string {
    const fromPass1 = outputs.from_pass_1 as Pass1Context | undefined;
    if (!fromPass1?.chunks_taught?.length || pass !== 'reading') return '';
    const totalChunks = fromPass1.chunks_taught.length;
    const minCount = Math.ceil(totalChunks * 0.6);
    return `## CHUNK COVERAGE TARGET (REQUIRED — DO NOT IGNORE)
- total_chunks = ${totalChunks}
- minimum_chunks_required = ${minCount} (60% of ${totalChunks}, rounded up)
- reading_text.chunks_used MUST be an array of at least ${minCount} chunk IDs. If chunks_used.length < ${minCount} the output is REJECTED. Plan which ${minCount}+ chunk IDs you will use before writing the narrative. This applies to every target language.\n`;
  }

  /**
   * Builds an explicit, human-readable context block that forces the LLM to use
   * chunks from previous passes. Instead of a JSON blob, this creates a numbered
   * checklist that the model can't ignore.
   */
  private buildExplicitContext(
    pass: ContentPass,
    outputs: PreviousPassOutputs,
  ): string {
    const fromPass1 = outputs.from_pass_1 as Pass1Context | undefined;
    const fromPass2 = outputs.from_pass_2 as Pass2Context | undefined;
    const fromPass3 = outputs.from_pass_3 as Pass3Context | undefined;

    const sections: string[] = [
      buildChunkSection(fromPass1, pass),
      buildGrammarSection(fromPass1),
      buildDialogueSection(fromPass1),
      buildSpeechFeaturesSection(fromPass1),
      ...buildPass2Sections(fromPass2, pass),
      ...buildPass3Sections(fromPass3, pass),
    ].filter((s): s is string => s !== null && s !== '');

    return sections.join('\n\n');
  }
}

type Pass1Context = {
  chunks_taught?: Array<{ id: string; chunk: string; context?: string }>;
  grammar_patterns_used?: string[];
  dialogue_summary?: string;
  connected_speech_features?: string[];
};

type Pass2Context = {
  reading_theme?: string;
  additional_vocabulary?: string[];
};

type Pass3Context = {
  podcast_scenario?: string;
  speakers_used?: string[];
};

function getMinChunkUsage(pass: ContentPass): string {
  if (pass === 'reading') return '60-70%';
  if (pass === 'podcast') return '60%';
  return '50%';
}

function buildChunkSection(
  fromPass1: Pass1Context | undefined,
  pass: ContentPass,
): string | null {
  if (!fromPass1?.chunks_taught?.length) return null;
  const totalChunks = fromPass1.chunks_taught.length;
  const minCount = Math.ceil(totalChunks * 0.6);
  const chunkList = fromPass1.chunks_taught
    .map(
      (c, i) =>
        `  ${i + 1}. "${c.chunk}" (${c.id}) — ${c.context ?? 'general use'}`,
    )
    .join('\n');
  const minUsage = getMinChunkUsage(pass);
  return `## MANDATORY CHUNKS FROM LESSON (CHUNK COVERAGE = VALIDATION RULE)

NUMERIC TARGET FOR THIS RUN (same for ALL target languages — French, Spanish, etc.):
- total_chunks = ${totalChunks}
- minimum_chunks_required = ${minCount} (60% of ${totalChunks}, rounded up)
- Your "chunks_used" array MUST contain at least ${minCount} chunk IDs. If you return fewer than ${minCount} IDs, the output is REJECTED. No exceptions.

The lesson taught these ${totalChunks} chunks. You MUST naturally incorporate at least ${minCount} of them (${minUsage}) in your output.

CHUNK LIST (use the exact "id" in chunks_used):
${chunkList}

WORKFLOW: (1) Choose at least ${minCount} chunk IDs from the list above — write them down. (2) Write the narrative weaving those chunks in. (3) Set reading_text.chunks_used to that list. If chunks_used.length < ${minCount}, validation FAIL.`;
}

function buildGrammarSection(
  fromPass1: Pass1Context | undefined,
): string | null {
  if (!fromPass1?.grammar_patterns_used?.length) return null;
  return `## GRAMMAR PATTERNS FROM LESSON
These patterns were taught. Use them naturally in context:
${fromPass1.grammar_patterns_used.map((p) => `  - ${p}`).join('\n')}`;
}

function buildDialogueSection(
  fromPass1: Pass1Context | undefined,
): string | null {
  if (!fromPass1?.dialogue_summary) return null;
  return `## LESSON DIALOGUE SUMMARY
The lesson dialogue was about: ${fromPass1.dialogue_summary}
Create a NEW scenario thematically connected but NOT a repeat of this dialogue.`;
}

function buildSpeechFeaturesSection(
  fromPass1: Pass1Context | undefined,
): string | null {
  if (!fromPass1?.connected_speech_features?.length) return null;
  return `## CONNECTED SPEECH FEATURES
Include these naturally when representing spoken/informal language:
${fromPass1.connected_speech_features.map((f) => `  - ${f}`).join('\n')}`;
}

function buildPass2Sections(
  fromPass2: Pass2Context | undefined,
  pass: ContentPass,
): string[] {
  const out: string[] = [];
  if (!fromPass2 || (pass !== 'podcast' && pass !== 'speaking')) return out;
  if (fromPass2.reading_theme) {
    out.push(`## READING CONTEXT
The reading text covered: ${fromPass2.reading_theme}
Create a different angle on the same theme.`);
  }
  if (fromPass2.additional_vocabulary?.length) {
    out.push(`## ADDITIONAL VOCABULARY FROM READING
These words were introduced in reading: ${fromPass2.additional_vocabulary.join(', ')}`);
  }
  return out;
}

function buildPass3Sections(
  fromPass3: Pass3Context | undefined,
  pass: ContentPass,
): string[] {
  if (!fromPass3 || pass !== 'speaking') return [];
  if (!fromPass3.podcast_scenario) return [];
  return [
    `## PODCAST CONTEXT
The podcast episode covered: ${fromPass3.podcast_scenario}
Use different characters and scenarios for speaking practice.`,
  ];
}
