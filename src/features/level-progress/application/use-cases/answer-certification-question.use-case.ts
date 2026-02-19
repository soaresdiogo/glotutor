import type { ICertificationExamRepository } from '@/features/level-progress/domain/repositories/certification-exam.repository.interface';
import type { ICertificationExamAnswerRepository } from '@/features/level-progress/domain/repositories/certification-exam-answer.repository.interface';
import type { PlacementQuestionEntity } from '@/features/placement-test/domain/entities/placement-question.entity';
import type { IPlacementQuestionRepository } from '@/features/placement-test/domain/repositories/placement-question.repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';
import type { ICompleteCertificationExamUseCase } from './complete-certification-exam.use-case';

export type AnswerCertificationQuestionResult =
  | {
      kind: 'next';
      question: PlacementQuestionEntity;
      questionsAnswered: number;
    }
  | {
      kind: 'result';
      examId: string;
      passed: boolean;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      nextLevelUnlocked: string | null;
    };

export interface IAnswerCertificationQuestionUseCase {
  execute(
    userId: string,
    examId: string,
    questionId: string,
    selectedOptionIndex: number,
  ): Promise<AnswerCertificationQuestionResult>;
}

export class AnswerCertificationQuestionUseCase
  implements IAnswerCertificationQuestionUseCase
{
  constructor(
    private readonly examRepo: ICertificationExamRepository,
    private readonly questionRepo: IPlacementQuestionRepository,
    private readonly answerRepo: ICertificationExamAnswerRepository,
    private readonly completeExamUseCase: ICompleteCertificationExamUseCase,
  ) {}

  async execute(
    userId: string,
    examId: string,
    questionId: string,
    selectedOptionIndex: number,
  ): Promise<AnswerCertificationQuestionResult> {
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

    const question = await this.questionRepo.findById(questionId);
    if (
      !question ||
      question.language !== exam.language ||
      question.cefrLevel !== exam.cefrLevel
    ) {
      throw new NotFoundError(
        'Question not found or does not belong to this exam.',
        'certification.questionNotFound',
      );
    }

    const isCorrect = question.correctOptionIndex === selectedOptionIndex;
    await this.answerRepo.create({
      examId,
      questionId,
      selectedOptionIndex,
      isCorrect,
    });

    const questionsAnswered = await this.answerRepo.countByExamId(examId);

    if (questionsAnswered >= exam.totalQuestions) {
      const result = await this.completeExamUseCase.execute(userId, examId);
      return {
        kind: 'result',
        examId: result.examId,
        passed: result.passed,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        nextLevelUnlocked: result.nextLevelUnlocked,
      };
    }

    const answeredIds = await this.answerRepo.findQuestionIdsByExamId(examId);
    const nextQuestions =
      await this.questionRepo.findRandomCertificationByLanguageAndLevel(
        exam.language,
        exam.cefrLevel,
        1,
        answeredIds,
      );

    if (nextQuestions.length === 0) {
      const result = await this.completeExamUseCase.execute(userId, examId);
      return {
        kind: 'result',
        examId: result.examId,
        passed: result.passed,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        nextLevelUnlocked: result.nextLevelUnlocked,
      };
    }

    return {
      kind: 'next',
      question: nextQuestions[0],
      questionsAnswered,
    };
  }
}
