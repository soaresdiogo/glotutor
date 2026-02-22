import type { ILevelProgressProvider } from '@/features/level-progress/domain/ports/level-progress-provider.interface';
import type { IUserLanguageStudyTimeRepository } from '@/features/user-languages/domain/repositories/user-language-study-time.repository.interface';
import { BadRequestError } from '@/shared/lib/errors';
import type { CertificateEntity } from '../../domain/entities/certificate.entity';
import type { ICertificateRepository } from '../../domain/repositories/certificate.repository.interface';

export type IssueCertificateInput = {
  userId: string;
  userFullName: string;
  language: string;
  languageName: string;
  cefrLevel: string;
  levelName: string;
};

export interface IIssueCertificateUseCase {
  execute(input: IssueCertificateInput): Promise<CertificateEntity>;
}

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

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GLT-';
  const year = new Date().getFullYear();
  code += `${String(year)}-`;
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class IssueCertificateUseCase implements IIssueCertificateUseCase {
  constructor(
    private readonly levelProgress: ILevelProgressProvider,
    private readonly certificateRepo: ICertificateRepository,
    private readonly studyTimeRepo: IUserLanguageStudyTimeRepository,
  ) {}

  async execute(input: IssueCertificateInput): Promise<CertificateEntity> {
    const { userId, language, cefrLevel } = input;

    const existing = await this.certificateRepo.findByUserAndLevel(
      userId,
      language,
      cefrLevel,
    );
    if (existing) {
      throw new BadRequestError(
        'Certificate already issued for this level.',
        'certificates.alreadyIssued',
      );
    }

    const progress = await this.levelProgress.getLevelProgress(
      userId,
      language,
      cefrLevel,
    );
    if (!isLevelFullyCompleted(progress)) {
      throw new BadRequestError(
        'Level not fully completed. Complete all lessons, podcasts, readings and conversations for this level.',
        'certificates.levelNotCompleted',
      );
    }

    const totalStudyMinutes =
      await this.studyTimeRepo.totalMinutesByUserAndLanguage(userId, language);
    const completedAt = new Date();
    let verificationCode = generateVerificationCode();
    let attempts = 0;
    while (attempts < 10) {
      const collision =
        await this.certificateRepo.findByVerificationCode(verificationCode);
      if (!collision) break;
      verificationCode = generateVerificationCode();
      attempts++;
    }

    return this.certificateRepo.create({
      userId,
      language: input.language,
      cefrLevel: input.cefrLevel,
      studentName: input.userFullName.trim(),
      languageName: input.languageName,
      levelName: input.levelName,
      totalStudyMinutes,
      completedAt,
      verificationCode,
    });
  }
}
