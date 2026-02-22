import { DrizzleLevelProgressRepository } from '@/features/level-progress/infrastructure/drizzle-repositories/level-progress.repository';
import { ContentTotalsProvider } from '@/features/level-progress/infrastructure/providers/content-totals.provider';
import { LevelProgressProvider } from '@/features/level-progress/infrastructure/providers/level-progress.provider';
import { DrizzleUserLanguageStudyTimeRepository } from '@/features/user-languages/infrastructure/drizzle-repositories/user-language-study-time.repository';
import { db } from '@/infrastructure/db/client';
import { DrizzleCertificateRepository } from '../../infrastructure/drizzle-repositories/certificate.repository';
import type { IIssueCertificateUseCase } from '../use-cases/issue-certificate.use-case';
import { IssueCertificateUseCase } from '../use-cases/issue-certificate.use-case';

export function makeIssueCertificateUseCase(): IIssueCertificateUseCase {
  return new IssueCertificateUseCase(
    new LevelProgressProvider(
      db,
      new DrizzleLevelProgressRepository(db),
      new ContentTotalsProvider(db),
    ),
    new DrizzleCertificateRepository(db),
    new DrizzleUserLanguageStudyTimeRepository(db),
  );
}
