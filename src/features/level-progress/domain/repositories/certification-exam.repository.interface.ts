import type { CertificationExamEntity } from '../entities/certification-exam.entity';

export interface ICertificationExamRepository {
  create(data: {
    userId: string;
    language: string;
    cefrLevel: string;
    totalQuestions: number;
  }): Promise<CertificationExamEntity>;

  findById(id: string): Promise<CertificationExamEntity | null>;

  update(
    id: string,
    data: {
      status?: CertificationExamEntity['status'];
      score?: number | null;
      correctAnswers?: number;
      completedAt?: Date | null;
    },
  ): Promise<CertificationExamEntity>;
}
