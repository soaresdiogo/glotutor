import type { ICertificationExamRepository } from '@/features/level-progress/domain/repositories/certification-exam.repository.interface';
import type { ICertificationExamAnswerRepository } from '@/features/level-progress/domain/repositories/certification-exam-answer.repository.interface';
import { getNextLevel } from '@/features/placement-test/domain/constants/cefr-levels';
import type { IUserLanguageProgressRepository } from '@/features/user-languages/domain/repositories/user-language-progress.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

const CERTIFICATION_PASS_PERCENT = 70;

export type CompleteCertificationExamResult = {
  examId: string;
  passed: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  nextLevelUnlocked: string | null;
};

export interface ICompleteCertificationExamUseCase {
  execute(
    userId: string,
    examId: string,
  ): Promise<CompleteCertificationExamResult>;
}

export class CompleteCertificationExamUseCase
  implements ICompleteCertificationExamUseCase
{
  constructor(
    private readonly examRepo: ICertificationExamRepository,
    private readonly answerRepo: ICertificationExamAnswerRepository,
    private readonly userLanguageProgressRepo: IUserLanguageProgressRepository,
  ) {}

  async execute(
    userId: string,
    examId: string,
  ): Promise<CompleteCertificationExamResult> {
    const exam = await this.examRepo.findById(examId);
    if (!exam || exam.userId !== userId) {
      throw new NotFoundError(
        'Certification exam not found.',
        'certification.examNotFound',
      );
    }
    if (exam.status !== 'in_progress') {
      throw new BadRequestError(
        'Exam is not in progress.',
        'certification.notInProgress',
      );
    }

    const [_answerCount, correctCount] = await Promise.all([
      this.answerRepo.countByExamId(examId),
      this.answerRepo.getCorrectCountByExamId(examId),
    ]);

    const totalQuestions = exam.totalQuestions;
    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const passed = score >= CERTIFICATION_PASS_PERCENT;

    await this.examRepo.update(examId, {
      status: passed ? 'passed' : 'failed',
      score,
      correctAnswers: correctCount,
      completedAt: new Date(),
    });

    let nextLevelUnlocked: string | null = null;
    if (passed) {
      const nextLevel = getNextLevel(exam.cefrLevel);
      if (nextLevel) {
        const ulp = await this.userLanguageProgressRepo.findByUserAndLanguage(
          userId,
          exam.language,
        );
        if (ulp) {
          await this.userLanguageProgressRepo.updateLevel(ulp.id, nextLevel);
          nextLevelUnlocked = nextLevel;
        }
      }
    }

    return {
      examId,
      passed,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      nextLevelUnlocked,
    };
  }
}
