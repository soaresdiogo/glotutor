import type { NextRequest } from 'next/server';

import { getLevelProgressAuthUser } from '@/app/api/level-progress/get-auth-user';
import { makeCompleteCertificationExamUseCase } from '@/features/level-progress/application/factories/complete-certification-exam.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getLevelProgressAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'certification.notAuthenticated',
      );
    }
    const body = await req.json();
    const examId = typeof body?.examId === 'string' ? body.examId.trim() : '';
    if (!examId) {
      return Response.json({ message: 'examId is required' }, { status: 400 });
    }
    const useCase = makeCompleteCertificationExamUseCase();
    const result = await useCase.execute(user.id, examId);
    return Response.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
