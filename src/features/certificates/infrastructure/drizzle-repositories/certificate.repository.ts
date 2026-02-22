import { and, desc, eq } from 'drizzle-orm';
import type { CertificateEntity } from '@/features/certificates/domain/entities/certificate.entity';
import type { ICertificateRepository } from '@/features/certificates/domain/repositories/certificate.repository.interface';
import { certificates } from '@/infrastructure/db/schema/certificates';
import type { DbClient } from '@/infrastructure/db/types';

export class DrizzleCertificateRepository implements ICertificateRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: {
    userId: string;
    language: string;
    cefrLevel: string;
    studentName: string;
    languageName: string;
    levelName: string;
    totalStudyMinutes: number;
    completedAt: Date;
    verificationCode: string;
  }): Promise<CertificateEntity> {
    const [row] = await this.db.insert(certificates).values(data).returning();
    if (!row) throw new Error('Failed to create certificate');
    return this.toEntity(row);
  }

  async findByVerificationCode(
    code: string,
  ): Promise<CertificateEntity | null> {
    const row = await this.db.query.certificates.findFirst({
      where: eq(certificates.verificationCode, code),
    });
    return row ? this.toEntity(row) : null;
  }

  async findByUserAndLevel(
    userId: string,
    language: string,
    cefrLevel: string,
  ): Promise<CertificateEntity | null> {
    const row = await this.db.query.certificates.findFirst({
      where: and(
        eq(certificates.userId, userId),
        eq(certificates.language, language),
        eq(certificates.cefrLevel, cefrLevel),
      ),
    });
    return row ? this.toEntity(row) : null;
  }

  async findByUserId(userId: string): Promise<CertificateEntity[]> {
    const rows = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.createdAt));
    return rows.map((r) => this.toEntity(r));
  }

  private toEntity(row: typeof certificates.$inferSelect): CertificateEntity {
    return {
      id: row.id,
      userId: row.userId,
      language: row.language,
      cefrLevel: row.cefrLevel,
      studentName: row.studentName,
      languageName: row.languageName,
      levelName: row.levelName,
      totalStudyMinutes: row.totalStudyMinutes,
      completedAt: row.completedAt,
      verificationCode: row.verificationCode,
      createdAt: row.createdAt,
    };
  }
}
