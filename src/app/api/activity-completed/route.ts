import type { NextRequest } from 'next/server';

import { getUserLanguagesAuthUser } from '@/app/api/user-languages/get-auth-user';
import { makeCompleteActivityUseCase } from '@/features/activity-completion/application/factories/complete-activity.factory';
import type { ActivityType } from '@/features/level-progress/domain/repositories/level-progress.repository.interface';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

const VALID_ACTIVITY_TYPES: ActivityType[] = [
  'lesson',
  'podcast',
  'reading',
  'conversation',
];

export async function POST(req: NextRequest) {
  try {
    const user = await getUserLanguagesAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'activityCompleted.notAuthenticated',
      );
    }

    const body = await req.json();
    const language =
      typeof body?.language === 'string' ? body.language.trim() : '';
    const cefrLevel =
      typeof body?.cefrLevel === 'string' ? body.cefrLevel.trim() : '';
    const activityType = VALID_ACTIVITY_TYPES.includes(body?.activityType)
      ? body.activityType
      : undefined;
    const durationMinutes =
      typeof body?.durationMinutes === 'number' && body.durationMinutes >= 0
        ? body.durationMinutes
        : 0;

    if (!language || !cefrLevel || !activityType) {
      return Response.json(
        {
          message: 'language, cefrLevel and activityType are required',
        },
        { status: 400 },
      );
    }

    const useCase = makeCompleteActivityUseCase();
    await useCase.execute({
      userId: user.id,
      language,
      cefrLevel,
      activityType,
      durationMinutes,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
