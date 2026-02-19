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
   */
  generate(
    prompt: ComposedPrompt,
    pass: ContentPass,
    options?: { cefrLevel?: string },
  ): Promise<string>;
}
