import type {
  GenerationRequest,
  ModuleSpec,
} from '../types/generation-request.types';

/**
 * Resolves full ModuleSpec from a GenerationRequest by loading
 * module metadata from 06-MODULE-LIST and level params from 01-LEVEL-PARAMS.
 */
export interface IModuleSpecResolver {
  resolve(request: GenerationRequest): Promise<ModuleSpec>;
}
