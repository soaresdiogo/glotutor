import type { IModuleSpecResolver } from '@/features/content-generation/domain/ports/module-spec-resolver.interface';
import type {
  GenerationRequest,
  ModuleSpec,
} from '@/features/content-generation/domain/types/generation-request.types';
import { loadLevelParams } from '../utils/level-params-parser';
import { getModuleMetadata } from '../utils/module-list-parser';

export class ModuleSpecResolverService implements IModuleSpecResolver {
  async resolve(request: GenerationRequest): Promise<ModuleSpec> {
    const meta = await getModuleMetadata(request.moduleId);
    const levelParams = await loadLevelParams(request.cefrLevel);

    const title = request.title ?? meta?.title ?? request.moduleId;
    const situationalTheme =
      request.situationalTheme ?? meta?.situationalTheme ?? '';
    const readingFormat =
      request.readingFormat ?? meta?.readingFormat ?? 'simple_review';

    const contentParams = levelParams.content_params ?? {};
    const readingWordCount = levelParams.reading?.word_count;
    const variationCount = levelParams.exercises?.variation_count;
    const chunkCount = contentParams.chunk_count;

    const moduleSpec: ModuleSpec = {
      moduleId: request.moduleId,
      title,
      cefrLevel: request.cefrLevel,
      targetLanguage: request.targetLanguage,
      nativeLanguage: request.nativeLanguage,
      situationalTheme,
      readingFormat,
      coreModuleNumber: meta?.phase ?? undefined,
      specificInstructions: request.specificInstructions,
      contentParams: {
        ...contentParams,
        chunkCount,
        readingWordCount,
        variationCount,
      },
      levelParams,
    };

    return moduleSpec;
  }
}
