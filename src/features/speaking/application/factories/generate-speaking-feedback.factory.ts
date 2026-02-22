import { env } from '@/env';
import type { IGenerateSpeakingFeedbackUseCase } from '@/features/speaking/application/use-cases/generate-speaking-feedback.use-case';
import { GenerateSpeakingFeedbackUseCase } from '@/features/speaking/application/use-cases/generate-speaking-feedback.use-case';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';
import { OpenAISpeakingFeedbackGateway } from '@/features/speaking/infrastructure/gateways/openai-speaking-feedback.gateway';
import { StudentProfileProvider } from '@/features/student-profile/infrastructure/student-profile.provider';
import { db } from '@/infrastructure/db/client';

export function makeGenerateSpeakingFeedbackUseCase(): IGenerateSpeakingFeedbackUseCase {
  return new GenerateSpeakingFeedbackUseCase(
    new SpeakingSessionRepository(db),
    new OpenAISpeakingFeedbackGateway(env.OPENAI_API_KEY ?? ''),
    new StudentProfileProvider(),
  );
}
