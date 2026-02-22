import { env } from '@/env';
import type { IGeneratePodcastUseCase } from '@/features/listening/application/use-cases/generate-podcast.use-case';
import { GeneratePodcastUseCase } from '@/features/listening/application/use-cases/generate-podcast.use-case';
import type { ITTSGateway } from '@/features/listening/domain/ports/tts-gateway.interface';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';
import { AzureListeningTTSGateway } from '@/features/listening/infrastructure/gateways/azure-tts.gateway';
import { OpenAIAIGateway } from '@/features/listening/infrastructure/gateways/openai-ai.gateway';
import { OpenAITTSGateway } from '@/features/listening/infrastructure/gateways/openai-tts.gateway';
import { S3StorageGateway } from '@/features/listening/infrastructure/gateways/s3-storage.gateway';
import { db } from '@/infrastructure/db/client';

/**
 * When AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are set, podcast TTS uses Azure Neural voices
 * per language so audio sounds like a native speaker (pt-BR, en-US, es-MX, fr-FR, de-DE, it-IT).
 * Otherwise falls back to OpenAI TTS (no per-language voice; may sound less native for non-English).
 */
function makePodcastTTSGateway(): ITTSGateway {
  const azureKey = process.env.AZURE_SPEECH_KEY ?? '';
  const azureRegion = process.env.AZURE_SPEECH_REGION ?? '';
  if (azureKey && azureRegion) {
    return new AzureListeningTTSGateway({
      subscriptionKey: azureKey,
      region: azureRegion,
    });
  }
  return new OpenAITTSGateway(env.OPENAI_API_KEY ?? '');
}

export function makeGeneratePodcastUseCase(): IGeneratePodcastUseCase {
  return new GeneratePodcastUseCase(
    new PodcastRepository(db),
    new OpenAIAIGateway(env.OPENAI_API_KEY ?? ''),
    makePodcastTTSGateway(),
    new S3StorageGateway(),
  );
}
