import { BadRequestError } from '@/shared/lib/errors';
import type { CertificateEntity } from '../../domain/entities/certificate.entity';
import type { ICertificateRepository } from '../../domain/repositories/certificate.repository.interface';

export interface IGetCertificateByCodeUseCase {
  execute(code: string): Promise<CertificateEntity>;
}

export class GetCertificateByCodeUseCase
  implements IGetCertificateByCodeUseCase
{
  constructor(private readonly certificateRepo: ICertificateRepository) {}

  async execute(code: string): Promise<CertificateEntity> {
    const cert = await this.certificateRepo.findByVerificationCode(
      code.trim().toUpperCase(),
    );
    if (!cert) {
      throw new BadRequestError(
        'Certificate not found.',
        'certificates.notFound',
      );
    }
    return cert;
  }
}
