import { db } from '@/infrastructure/db/client';
import { DrizzleCertificateRepository } from '../../infrastructure/drizzle-repositories/certificate.repository';
import type { IGetCertificateByCodeUseCase } from '../use-cases/get-certificate-by-code.use-case';
import { GetCertificateByCodeUseCase } from '../use-cases/get-certificate-by-code.use-case';

export function makeGetCertificateByCodeUseCase(): IGetCertificateByCodeUseCase {
  return new GetCertificateByCodeUseCase(new DrizzleCertificateRepository(db));
}
