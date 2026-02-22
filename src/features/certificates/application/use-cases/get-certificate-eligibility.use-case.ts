import type { ILevelProgressProvider } from '@/features/level-progress/domain/ports/level-progress-provider.interface';
import type { ICertificateRepository } from '../../domain/repositories/certificate.repository.interface';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type LevelEligibility = {
  cefrLevel: string;
  levelName: string;
  isLevelCompleted: boolean;
  certificateIssued: boolean;
  certificateId: string | null;
  verificationCode: string | null;
};

export type GetCertificateEligibilityResult = {
  language: string;
  levels: LevelEligibility[];
};

export interface IGetCertificateEligibilityUseCase {
  execute(
    userId: string,
    language: string,
    levelNames: Record<string, string>,
  ): Promise<GetCertificateEligibilityResult>;
}

/** Level is completed when 100% of lessons, podcasts, readings, conversations are done. */
function isLevelFullyCompleted(progress: {
  lessonsCompleted: number;
  lessonsTotal: number;
  podcastsCompleted: number;
  podcastsTotal: number;
  readingsCompleted: number;
  readingsTotal: number;
  conversationsCompleted: number;
  conversationsTotal: number;
}): boolean {
  return (
    progress.lessonsTotal > 0 &&
    progress.lessonsCompleted >= progress.lessonsTotal &&
    progress.podcastsCompleted >= progress.podcastsTotal &&
    progress.readingsCompleted >= progress.readingsTotal &&
    progress.conversationsCompleted >= progress.conversationsTotal
  );
}

export class GetCertificateEligibilityUseCase
  implements IGetCertificateEligibilityUseCase
{
  constructor(
    private readonly levelProgress: ILevelProgressProvider,
    private readonly certificateRepo: ICertificateRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
    levelNames: Record<string, string>,
  ): Promise<GetCertificateEligibilityResult> {
    const levels: LevelEligibility[] = [];

    for (const cefrLevel of CEFR_LEVELS) {
      const progress = await this.levelProgress.getLevelProgress(
        userId,
        language,
        cefrLevel,
      );
      const isLevelCompleted = isLevelFullyCompleted(progress);
      const existing = await this.certificateRepo.findByUserAndLevel(
        userId,
        language,
        cefrLevel,
      );

      levels.push({
        cefrLevel,
        levelName: levelNames[cefrLevel] ?? cefrLevel,
        isLevelCompleted,
        certificateIssued: !!existing,
        certificateId: existing?.id ?? null,
        verificationCode: existing?.verificationCode ?? null,
      });
    }

    return { language, levels };
  }
}
