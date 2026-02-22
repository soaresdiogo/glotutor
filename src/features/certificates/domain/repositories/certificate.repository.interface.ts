import type { CertificateEntity } from '../entities/certificate.entity';

export interface ICertificateRepository {
  create(data: {
    userId: string;
    language: string;
    cefrLevel: string;
    studentName: string;
    languageName: string;
    levelName: string;
    totalStudyMinutes: number;
    completedAt: Date;
    verificationCode: string;
  }): Promise<CertificateEntity>;

  findByVerificationCode(code: string): Promise<CertificateEntity | null>;

  findByUserAndLevel(
    userId: string,
    language: string,
    cefrLevel: string,
  ): Promise<CertificateEntity | null>;

  findByUserId(userId: string): Promise<CertificateEntity[]>;
}
