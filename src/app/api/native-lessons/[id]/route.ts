import type { NextRequest } from 'next/server';

import { makeGetLessonByIdUseCase } from '@/features/native-lessons/application/factories/get-lesson-by-id.factory';
import { NativeLessonPresenter } from '@/features/native-lessons/infrastructure/presenters/native-lesson.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getNativeLessonsAuthUser } from '../get-auth-user';

export async function GET(
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
    const useCase = makeGetLessonByIdUseCase();
    const lesson = await useCase.execute(id, user.id);
    return NativeLessonPresenter.lessonDetail(lesson);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
