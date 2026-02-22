import type { NextRequest } from 'next/server';
import { getReadingAuthUser } from '@/app/api/reading/get-auth-user';
import {
  getLanguageName,
  getLevelName,
} from '@/features/certificates/application/constants/level-names';
import { makeGetCertificateEligibilityUseCase } from '@/features/certificates/application/factories/get-certificate-eligibility.factory';
import { makeIssueCertificateUseCase } from '@/features/certificates/application/factories/issue-certificate.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function levelNamesForLanguage(lang: string): Record<string, string> {
  const names: Record<string, string> = {};
  for (const level of CEFR_LEVELS) {
    names[level] = getLevelName(lang, level);
  }
  return names;
}

export async function GET(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'certificates.notAuthenticated',
      );
    }
    const language = req.nextUrl.searchParams.get('language') ?? '';
    if (!language) {
      return Response.json(
        { message: 'language query is required' },
        { status: 400 },
      );
    }
    const levelNames = levelNamesForLanguage(language);
    const useCase = makeGetCertificateEligibilityUseCase();
    const result = await useCase.execute(user.id, language, levelNames);
    return Response.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'certificates.notAuthenticated',
      );
    }
    const body = (await req.json()) as {
      language?: string;
      cefrLevel?: string;
    };
    const language = typeof body.language === 'string' ? body.language : '';
    const cefrLevel = typeof body.cefrLevel === 'string' ? body.cefrLevel : '';
    if (!language || !cefrLevel) {
      return Response.json(
        { message: 'language and cefrLevel are required' },
        { status: 400 },
      );
    }
    const useCase = makeIssueCertificateUseCase();
    const cert = await useCase.execute({
      userId: user.id,
      userFullName: user.name ?? '',
      language,
      languageName: getLanguageName(language),
      cefrLevel,
      levelName: getLevelName(language, cefrLevel),
    });
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
    });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
