import type { IGetWordDetailsUseCase } from '@/features/reading/application/use-cases/get-word-details.use-case';
import { GetWordDetailsUseCase } from '@/features/reading/application/use-cases/get-word-details.use-case';
import { StudentProfileRepository } from '@/features/reading/infrastructure/drizzle-repositories/student-profile.repository';
import { OpenAIWordDetailsService } from '@/features/reading/infrastructure/services/openai-word-details.service';

import { db } from '@/infrastructure/db/client';

export function makeGetWordDetailsUseCase(): IGetWordDetailsUseCase {
  const openaiKey = process.env.OPENAI_API_KEY ?? '';
  return new GetWordDetailsUseCase(
    new StudentProfileRepository(db),
    new OpenAIWordDetailsService(openaiKey),
  );
}
