import type { CertificationExamEntity } from '@/features/level-progress/domain/entities/certification-exam.entity';
import type { ILevelProgressProvider } from '@/features/level-progress/domain/ports/level-progress-provider.interface';
import type { ICertificationExamRepository } from '@/features/level-progress/domain/repositories/certification-exam.repository.interface';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';
import type { IPlacementQuestionRepository } from '@/features/placement-test/domain/repositories/placement-question.repository.interface';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

const CERTIFICATION_QUESTIONS_PER_EXAM = 15;

export type StartCertificationExamResult = {
  exam: CertificationExamEntity;
  question: PlacementQuestionEntity;
};

export interface IStartCertificationExamUseCase {
  execute(
    userId: string,
    language: string,
  ): Promise<StartCertificationExamResult>;
}

export class StartCertificationExamUseCase
  implements IStartCertificationExamUseCase
{
  constructor(
    private readonly progressProvider: ILevelProgressProvider,
    private readonly userLanguageProgressRepo: IUserLanguageProgressRepository,
    private readonly examRepo: ICertificationExamRepository,
    private readonly questionRepo: IPlacementQuestionRepository,
  ) {}

  async execute(
    userId: string,
    language: string,
  ): Promise<StartCertificationExamResult> {
    const ulp = await this.userLanguageProgressRepo.findByUserAndLanguage(
      userId,
      language,
    );
    if (!ulp) {
      throw new NotFoundError(
        'Language not added for this user.',
        'levelProgress.languageNotAdded',
      );
    }

    const progress = await this.progressProvider.getLevelProgress(
      userId,
      language,
      ulp.currentLevel,
    );
    if (!progress.certificationUnlocked) {
      throw new BadRequestError(
        'Complete at least 80% of level activities to unlock the certification exam.',
        'certification.notUnlocked',
      );
    }
    if (progress.certifiedAt) {
      throw new BadRequestError(
        'Level already certified.',
        'certification.alreadyCertified',
      );
    }

    const questions =
      await this.questionRepo.findRandomCertificationByLanguageAndLevel(
        language,
        ulp.currentLevel,
        CERTIFICATION_QUESTIONS_PER_EXAM,
      );
    if (questions.length === 0) {
      throw new BadRequestError(
        'No certification questions available for this level.',
        'certification.noQuestions',
      );
    }

    const exam = await this.examRepo.create({
      userId,
      language,
      cefrLevel: ulp.currentLevel,
      totalQuestions: questions.length,
    });

    return { exam, question: questions[0] };
  }
}
