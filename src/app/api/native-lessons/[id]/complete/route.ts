import type { NextRequest } from 'next/server';

import type { LessonCompletionExerciseResult } from '@/features/native-lessons/application/dto/lesson-completion.dto';
import { makeCompleteLessonUseCase } from '@/features/native-lessons/application/factories/complete-lesson.factory';
import { NativeLessonPresenter } from '@/features/native-lessons/infrastructure/presenters/native-lesson.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getNativeLessonsAuthUser } from '../../get-auth-user';

const bodySchema = {
  results: [] as LessonCompletionExerciseResult[],
};

export async function POST(
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
    const results = body?.results ?? bodySchema.results;
    const useCase = makeCompleteLessonUseCase();
    const progress = await useCase.execute(user.id, id, results);
    return NativeLessonPresenter.completeSuccess(progress);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
