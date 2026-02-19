import type { IEvaluateReadingUseCase } from '@/features/reading/application/use-cases/evaluate-reading.use-case';
import { EvaluateReadingUseCase } from '@/features/reading/application/use-cases/evaluate-reading.use-case';
import { DailyProgressRepository } from '@/features/reading/infrastructure/drizzle-repositories/daily-progress.repository';
import { ReadingSessionRepository } from '@/features/reading/infrastructure/drizzle-repositories/reading-session.repository';
import { TextRepository } from '@/features/reading/infrastructure/drizzle-repositories/text.repository';
import { AzureSpeechPronunciationService } from '@/features/reading/infrastructure/services/azure-speech-pronunciation.service';

import { db } from '@/infrastructure/db/client';

/**
 * Reading evaluation uses Azure Speech only. Requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.
 */
export function makeEvaluateReadingUseCase(): IEvaluateReadingUseCase {
  const azureKey = process.env.AZURE_SPEECH_KEY ?? '';
  const azureRegion = process.env.AZURE_SPEECH_REGION ?? '';

  if (!azureKey || !azureRegion) {
    throw new Error(
      'Reading evaluation requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.',
    );
  }

  const azureService = new AzureSpeechPronunciationService(
    azureKey,
    azureRegion,
  );
  return new EvaluateReadingUseCase(
    new TextRepository(db),
    azureService,
    new ReadingSessionRepository(db),
    new DailyProgressRepository(db),
    azureService,
    null,
  );
}
