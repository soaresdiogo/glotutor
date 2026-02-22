import { DrizzleLevelProgressRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/level-progress.repository';
import { ContentTotalsProvider } from '@/features/level-progress/infrastructure/providers/content-totals.provider';
import { LevelProgressProvider } from '@/features/level-progress/infrastructure/providers/level-progress.provider';
import { db } from '@/infrastructure/db/client';
import { DrizzleCertificateRepository } from '../../infrastructure/drizzle-repositories/certificate.repository';
import type { IGetCertificateEligibilityUseCase } from '../use-cases/get-certificate-eligibility.use-case';
import { GetCertificateEligibilityUseCase } from '../use-cases/get-certificate-eligibility.use-case';

export function makeGetCertificateEligibilityUseCase(): IGetCertificateEligibilityUseCase {
  return new GetCertificateEligibilityUseCase(
    new LevelProgressProvider(
      db,
      new DrizzleLevelProgressRepository(db),
      new ContentTotalsProvider(db),
    ),
    new DrizzleCertificateRepository(db),
  );
}
