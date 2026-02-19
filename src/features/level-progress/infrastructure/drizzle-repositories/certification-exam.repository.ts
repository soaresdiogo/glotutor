import { eq } from 'drizzle-orm';
import type { CertificationExamEntity } from '@/features/level-progress/domain/entities/certification-exam.entity';
import type { ICertificationExamRepository } from '@/features/level-progress/domain/repositories/certification-exam.repository.interface';
import { certificationExams } from '@/infrastructure/db/schema/certification-exams';
import type { DbClient } from '@/infrastructure/db/types';

function toEntity(row: {
  id: string;
  userId: string;
  language: string;
  cefrLevel: string;
  status: string;
  score: string | null;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CertificationExamEntity {
  return {
    id: row.id,
    userId: row.userId,
    language: row.language,
    cefrLevel: row.cefrLevel,
    status: row.status as CertificationExamEntity['status'],
    score: row.score != null ? Number(row.score) : null,
    totalQuestions: row.totalQuestions,
    correctAnswers: row.correctAnswers,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleCertificationExamRepository
  implements ICertificationExamRepository
{
  constructor(private readonly db: DbClient) {}

  async create(data: {
    userId: string;
    language: string;
    cefrLevel: string;
    totalQuestions: number;
  }): Promise<CertificationExamEntity> {
    const [row] = await this.db
      .insert(certificationExams)
      .values({
        userId: data.userId,
        language: data.language,
        cefrLevel: data.cefrLevel,
        totalQuestions: data.totalQuestions,
      })
      .returning();
    if (!row) throw new Error('Failed to create certification exam');
    return toEntity(row);
  }

  async findById(id: string): Promise<CertificationExamEntity | null> {
    const row = await this.db.query.certificationExams.findFirst({
      where: eq(certificationExams.id, id),
    });
    return row ? toEntity(row) : null;
  }

  async update(
    id: string,
    data: {
      status?: CertificationExamEntity['status'];
      score?: number | null;
      correctAnswers?: number;
      completedAt?: Date | null;
    },
  ): Promise<CertificationExamEntity> {
    const [row] = await this.db
      .update(certificationExams)
      .set({
        ...(data.status !== undefined && { status: data.status }),
        ...(data.score !== undefined && {
          score: data.score == null ? null : String(data.score),
        }),
        ...(data.correctAnswers !== undefined && {
          correctAnswers: data.correctAnswers,
        }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt,
        }),
        updatedAt: new Date(),
      })
      .where(eq(certificationExams.id, id))
      .returning();
    if (!row) throw new Error('Certification exam not found for update');
    return toEntity(row);
  }
}
