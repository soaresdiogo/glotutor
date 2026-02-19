import type { NextRequest } from 'next/server';

import { makeStartLessonUseCase } from '@/features/native-lessons/application/factories/start-lesson.factory';
import { NativeLessonPresenter } from '@/features/native-lessons/infrastructure/presenters/native-lesson.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getNativeLessonsAuthUser } from '../../get-auth-user';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getTenantFromRequest(req);
    const user = await getNativeLessonsAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'nativeLessons.api.notAuthenticated',
      );
    }
    const { id } = await params;
    const useCase = makeStartLessonUseCase();
    const progress = await useCase.execute(user.id, id);
    return NativeLessonPresenter.startSuccess(progress);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
