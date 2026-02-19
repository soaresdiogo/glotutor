import type {
  ComposedPrompt,
  ContentPass,
  ModuleSpec,
} from '../types/generation-request.types';

/** Context extracted from previous pass outputs for injection into next pass */
export type PreviousPassOutputs = Record<string, unknown>;

/**
 * Composes prompts from files in /prompts (base + level + pass + previous context).
 */
export interface IPromptComposer {
  compose(
    pass: ContentPass,
    moduleSpec: ModuleSpec,
    previousPassOutputs?: PreviousPassOutputs,
  ): Promise<ComposedPrompt>;
}
