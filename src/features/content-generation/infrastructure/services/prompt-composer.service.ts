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
    const variables: Record<string, unknown> = {
      ...moduleSpec,
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
      ...(previousPassOutputs ?? {}),
    };

    const systemPrompt = injectVariables(basePrompt, variables);

    const passPath = PASS_PROMPT_PATHS[pass];
    const passPrompt = await loadPromptFile(passPath);
    const injectedPassPrompt = injectVariables(passPrompt, variables);

    let contextBlock = '';
    if (previousPassOutputs && pass !== 'lesson') {
      contextBlock = this.buildExplicitContext(pass, previousPassOutputs);
    }

    const userMessage = [
      `## LEVEL CONFIGURATION\n${JSON.stringify(levelParams, null, 2)}`,
      contextBlock,
      injectedPassPrompt,
    ]
      .filter(Boolean)
      .join('\n\n');

    return { systemPrompt, userMessage };
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
    const sections: string[] = [];

    const fromPass1 = outputs.from_pass_1 as
      | {
          chunks_taught?: Array<{
            id: string;
            chunk: string;
            context?: string;
          }>;
          grammar_patterns_used?: string[];
          dialogue_summary?: string;
          connected_speech_features?: string[];
        }
      | undefined;

    if (fromPass1?.chunks_taught?.length) {
      const chunkList = fromPass1.chunks_taught
        .map(
          (c, i) =>
            `  ${i + 1}. "${c.chunk}" (${c.id}) — ${c.context ?? 'general use'}`,
        )
        .join('\n');

      const minUsage =
        pass === 'reading' ? '60-70%' : pass === 'podcast' ? '60%' : '50%';
      const minCount = Math.ceil(fromPass1.chunks_taught.length * 0.6);

      sections.push(`## MANDATORY CHUNKS FROM LESSON
The lesson taught these ${fromPass1.chunks_taught.length} chunks. You MUST naturally incorporate at least ${minCount} of them (${minUsage}) in your output.

CHUNK LIST:
${chunkList}

IMPORTANT: In your output JSON, include a "chunks_used" array listing the chunk IDs you used (e.g. ["chunk_001", "chunk_003", ...]). If you use fewer than ${minCount} chunks, the output will be REJECTED.`);
    }

    if (fromPass1?.grammar_patterns_used?.length) {
      sections.push(`## GRAMMAR PATTERNS FROM LESSON
These patterns were taught. Use them naturally in context:
${fromPass1.grammar_patterns_used.map((p) => `  - ${p}`).join('\n')}`);
    }

    if (fromPass1?.dialogue_summary) {
      sections.push(`## LESSON DIALOGUE SUMMARY
The lesson dialogue was about: ${fromPass1.dialogue_summary}
Create a NEW scenario thematically connected but NOT a repeat of this dialogue.`);
    }

    if (fromPass1?.connected_speech_features?.length) {
      sections.push(`## CONNECTED SPEECH FEATURES
Include these naturally when representing spoken/informal language:
${fromPass1.connected_speech_features.map((f) => `  - ${f}`).join('\n')}`);
    }

    const fromPass2 = outputs.from_pass_2 as
      | {
          reading_theme?: string;
          additional_vocabulary?: string[];
        }
      | undefined;

    if (fromPass2 && (pass === 'podcast' || pass === 'speaking')) {
      if (fromPass2.reading_theme) {
        sections.push(`## READING CONTEXT
The reading text covered: ${fromPass2.reading_theme}
Create a different angle on the same theme.`);
      }
      if (fromPass2.additional_vocabulary?.length) {
        sections.push(`## ADDITIONAL VOCABULARY FROM READING
These words were introduced in reading: ${fromPass2.additional_vocabulary.join(', ')}`);
      }
    }

    const fromPass3 = outputs.from_pass_3 as
      | {
          podcast_scenario?: string;
          speakers_used?: string[];
        }
      | undefined;

    if (fromPass3 && pass === 'speaking') {
      if (fromPass3.podcast_scenario) {
        sections.push(`## PODCAST CONTEXT
The podcast episode covered: ${fromPass3.podcast_scenario}
Use different characters and scenarios for speaking practice.`);
      }
    }

    return sections.join('\n\n');
  }
}
