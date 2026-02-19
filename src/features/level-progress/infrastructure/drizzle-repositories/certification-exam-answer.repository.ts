import { and, eq, sql } from 'drizzle-orm';
import type { ICertificationExamAnswerRepository } from '@/features/level-progress/domain/repositories/certification-exam-answer.repository.interface';
import { certificationExamAnswers } from '@/infrastructure/db/schema/certification-exam-answers';
import type { DbClient } from '@/infrastructure/db/types';

export class DrizzleCertificationExamAnswerRepository
  implements ICertificationExamAnswerRepository
{
  constructor(private readonly db: DbClient) {}

  async create(data: {
    examId: string;
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(certificationExamAnswers)
      .values({
        examId: data.examId,
        questionId: data.questionId,
        selectedOptionIndex: data.selectedOptionIndex,
        isCorrect: data.isCorrect,
      })
      .returning({ id: certificationExamAnswers.id });
    if (!row) throw new Error('Failed to create certification exam answer');
    return { id: row.id };
  }

  async countByExamId(examId: string): Promise<number> {
    const [r] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(certificationExamAnswers)
      .where(eq(certificationExamAnswers.examId, examId));
    return r?.count ?? 0;
  }

  async getCorrectCountByExamId(examId: string): Promise<number> {
    const [r] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(certificationExamAnswers)
      .where(
        and(
          eq(certificationExamAnswers.examId, examId),
          eq(certificationExamAnswers.isCorrect, true),
        ),
      );
    return r?.count ?? 0;
  }

  async findQuestionIdsByExamId(examId: string): Promise<string[]> {
    const rows = await this.db
      .select({ questionId: certificationExamAnswers.questionId })
      .from(certificationExamAnswers)
      .where(eq(certificationExamAnswers.examId, examId));
    return rows.map((r) => r.questionId);
  }
}
