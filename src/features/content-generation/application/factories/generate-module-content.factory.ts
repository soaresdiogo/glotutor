import { GenerateModuleContentUseCase } from '@/features/content-generation/application/use-cases/generate-module-content.use-case';
import {
  saveLessonToDb,
  savePodcastToDb,
  saveReadingToDb,
  saveSpeakingToDb,
} from '@/features/content-generation/infrastructure/persistence/content-db-mappers';
import { LLMContentGenerator } from '@/features/content-generation/infrastructure/services/llm-content-generator';
import { ModuleSpecResolverService } from '@/features/content-generation/infrastructure/services/module-spec-resolver.service';
import { PromptComposerService } from '@/features/content-generation/infrastructure/services/prompt-composer.service';
import { generatePodcastTts } from '@/features/listening/infrastructure/services/podcast-tts-generator';
import { db } from '@/infrastructure/db/client';

export function makeGenerateModuleContentUseCase(
  apiKey: string,
): GenerateModuleContentUseCase {
  const specResolver = new ModuleSpecResolverService();
  const promptComposer = new PromptComposerService();
  const contentGenerator = new LLMContentGenerator(apiKey);

  return new GenerateModuleContentUseCase(
    specResolver,
    promptComposer,
    contentGenerator,
    (output, spec) => saveLessonToDb(db, output, spec),
    (output, spec) => saveReadingToDb(db, output, spec),
    async (output, spec) => {
      const podcastId = await savePodcastToDb(db, output, spec);
      if (podcastId && apiKey) {
        const result = await generatePodcastTts(podcastId, apiKey);
        if (!result.ok) {
          console.warn(
            `Podcast TTS skipped or failed (${podcastId}): ${result.reason}`,
          );
        }
      }
    },
    (output, spec) => saveSpeakingToDb(db, output, spec),
  );
}
