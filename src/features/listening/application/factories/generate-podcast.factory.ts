import { env } from '@/env';
import type { IGeneratePodcastUseCase } from '@/features/listening/application/use-cases/generate-podcast.use-case';
import { GeneratePodcastUseCase } from '@/features/listening/application/use-cases/generate-podcast.use-case';
import { PodcastRepository } from '@/features/listening/infrastructure/drizzle-repositories/podcast.repository';
import { OpenAIAIGateway } from '@/features/listening/infrastructure/gateways/openai-ai.gateway';
import { OpenAITTSGateway } from '@/features/listening/infrastructure/gateways/openai-tts.gateway';
import { S3StorageGateway } from '@/features/listening/infrastructure/gateways/s3-storage.gateway';
import { db } from '@/infrastructure/db/client';

export function makeGeneratePodcastUseCase(): IGeneratePodcastUseCase {
  return new GeneratePodcastUseCase(
    new PodcastRepository(db),
    new OpenAIAIGateway(env.OPENAI_API_KEY ?? ''),
    new OpenAITTSGateway(env.OPENAI_API_KEY ?? ''),
    new S3StorageGateway(),
  );
}
