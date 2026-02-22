import { GenerateModuleContentUseCase } from '@/features/content-generation/application/use-cases/generate-module-content.use-case';
import type { ModuleSpec } from '@/features/content-generation/domain/types/generation-request.types';
import { getContentGenerationConfig } from '@/features/content-generation/infrastructure/config/content-generation.env';
import {
  saveLessonToDb,
  savePodcastToDb,
  saveReadingToDb,
  saveSpeakingToDb,
} from '@/features/content-generation/infrastructure/persistence/content-db-mappers';
import { GeminiContentGenerator } from '@/features/content-generation/infrastructure/services/gemini-content-generator';
import { LLMContentGenerator } from '@/features/content-generation/infrastructure/services/llm-content-generator';
import { getLessonContentForContext } from '@/features/content-generation/infrastructure/services/module-content-existence.service';
import { ModuleSpecResolverService } from '@/features/content-generation/infrastructure/services/module-spec-resolver.service';
import { PromptComposerService } from '@/features/content-generation/infrastructure/services/prompt-composer.service';
import { generatePodcastTts } from '@/features/listening/infrastructure/services/podcast-tts-generator';
import { db } from '@/infrastructure/db/client';

/**
 * Builds the use case with provider and API key from env.
 * Set in .env: CONTENT_GENERATION_PROVIDER=openai|gemini, then OPENAI_API_KEY or GEMINI_API_KEY.
 * Optionally CONTENT_GENERATION_MODEL (e.g. gpt-4o-mini, gemini-1.5-pro).
 */
export function makeGenerateModuleContentUseCase(): GenerateModuleContentUseCase {
  const config = getContentGenerationConfig();
  const specResolver = new ModuleSpecResolverService();
  const promptComposer = new PromptComposerService();
  const contentGenerator =
    config.provider === 'gemini'
      ? new GeminiContentGenerator(config.apiKey, config.model)
      : new LLMContentGenerator(config.apiKey, config.model);

  const loadLessonContext = async (
    spec: ModuleSpec,
  ): Promise<{ content: Record<string, unknown> } | null> =>
    getLessonContentForContext(
      db,
      spec.moduleId,
      spec.cefrLevel,
      spec.targetLanguage,
    );

  return new GenerateModuleContentUseCase(
    specResolver,
    promptComposer,
    contentGenerator,
    (output, spec) => saveLessonToDb(db, output, spec),
    (output, spec) => saveReadingToDb(db, output, spec),
    async (output, spec) => {
      const podcastId = await savePodcastToDb(db, output, spec);
      const openaiKeyForTts = process.env.OPENAI_API_KEY?.trim();
      if (podcastId && openaiKeyForTts) {
        const result = await generatePodcastTts(podcastId, openaiKeyForTts);
        if (!result.ok) {
          console.warn(
            `Podcast TTS skipped or failed (${podcastId}): ${result.reason}`,
          );
        }
      }
    },
    (output, spec) => saveSpeakingToDb(db, output, spec),
    loadLessonContext,
  );
}
