export type CertificationExamStatus = 'in_progress' | 'passed' | 'failed';

export type CertificationExamEntity = {
  id: string;
  userId: string;
  language: string;
  cefrLevel: string;
  status: CertificationExamStatus;
  score: number | null;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
