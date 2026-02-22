import type {
  ComposedPrompt,
  ContentPass,
} from '../types/generation-request.types';

/**
 * Port for the LLM content generator.
 * Infrastructure implements this (e.g. OpenAI/Claude).
 */
export interface IContentGeneratorPort {
  /**
   * Call the LLM with the composed prompt and return raw JSON string.
   * @param options.cefrLevel — Used by lesson sub-pass to scale sections/exercises by level.
   * @param options.isLessonPatch — When true and pass is 'lesson', use a single completion (no A/B1/B2 sub-passes). Use only for patch fixes to avoid wasting tokens.
   * @param options.targetLanguage — Used by lesson sub-pass for immersion vs L1 wording when nativeEqualsTarget.
   * @param options.nativeLanguage — Used by lesson sub-pass for immersion vs L1 wording.
   */
  generate(
    prompt: ComposedPrompt,
    pass: ContentPass,
    options?: {
      cefrLevel?: string;
      isLessonPatch?: boolean;
      targetLanguage?: string;
      nativeLanguage?: string;
    },
  ): Promise<string>;
}
