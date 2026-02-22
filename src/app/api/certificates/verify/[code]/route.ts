import type { NextRequest } from 'next/server';
import { makeGetCertificateByCodeUseCase } from '@/features/certificates/application/factories/get-certificate-by-code.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    await getTenantFromRequest(req);
    const { code } = await params;
    if (!code?.trim()) {
      return Response.json({ message: 'Code is required' }, { status: 400 });
    }
    const useCase = makeGetCertificateByCodeUseCase();
    const cert = await useCase.execute(code.trim().toUpperCase());
    return Response.json({
      id: cert.id,
      verificationCode: cert.verificationCode,
      studentName: cert.studentName,
      language: cert.language,
      languageName: cert.languageName,
      cefrLevel: cert.cefrLevel,
      levelName: cert.levelName,
      totalStudyMinutes: cert.totalStudyMinutes,
      completedAt: cert.completedAt.toISOString(),
      createdAt: cert.createdAt.toISOString(),
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
