import type { NextRequest } from 'next/server';

import { makeCheckDailyLimitUseCase } from '@/features/native-lessons/application/factories/check-daily-limit.factory';
import { NativeLessonPresenter } from '@/features/native-lessons/infrastructure/presenters/native-lesson.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getNativeLessonsAuthUser } from '../get-auth-user';

export async function GET(req: NextRequest) {
  try {
    const user = await getNativeLessonsAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'nativeLessons.api.notAuthenticated',
      );
    }
    const useCase = makeCheckDailyLimitUseCase();
    const data = await useCase.execute(user.id);
    return NativeLessonPresenter.dailyLimit(data);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
