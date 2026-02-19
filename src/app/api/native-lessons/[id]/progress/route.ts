import type { NextRequest } from 'next/server';

import type { LessonCompletionExerciseResult } from '@/features/native-lessons/application/dto/lesson-completion.dto';
import { makeSaveLessonProgressUseCase } from '@/features/native-lessons/application/factories/save-lesson-progress.factory';
import { NativeLessonPresenter } from '@/features/native-lessons/infrastructure/presenters/native-lesson.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getNativeLessonsAuthUser } from '../../get-auth-user';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getNativeLessonsAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'nativeLessons.api.notAuthenticated',
      );
    }
    const { id } = await params;
    const body = (await req.json()) as {
      results?: LessonCompletionExerciseResult[];
    };
    const results = body?.results ?? [];
    const useCase = makeSaveLessonProgressUseCase();
    const progress = await useCase.execute(user.id, id, results);
    return NativeLessonPresenter.saveProgressSuccess(progress);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
