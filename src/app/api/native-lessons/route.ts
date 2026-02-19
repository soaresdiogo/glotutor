import type { NextRequest } from 'next/server';

import { makeGetLessonsForLevelUseCase } from '@/features/native-lessons/application/factories/get-lessons-for-level.factory';
import { NativeLessonPresenter } from '@/features/native-lessons/infrastructure/presenters/native-lesson.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getNativeLessonsAuthUser } from './get-auth-user';

export async function GET(req: NextRequest) {
  try {
    const user = await getNativeLessonsAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'nativeLessons.api.notAuthenticated',
      );
    }
    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') ?? '';
    const level = searchParams.get('level') ?? '';
    if (!language || !level) {
      return Response.json(
        { message: 'Missing language or level' },
        { status: 400 },
      );
    }
    const useCase = makeGetLessonsForLevelUseCase();
    const lessons = await useCase.execute(user.id, language, level);
    return NativeLessonPresenter.lessonList(lessons);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
