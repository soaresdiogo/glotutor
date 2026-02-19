import type { NextRequest } from 'next/server';

import { updateProgressSchema } from '@/features/listening/application/dto/update-progress.dto';
import { makeUpdateListeningProgressUseCase } from '@/features/listening/application/factories/update-listening-progress.factory';
import { ProgressPresenter } from '@/features/listening/infrastructure/presenters/progress.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { UnauthorizedError } from '@/shared/lib/errors';

import { getListeningAuthUser } from '../../../get-auth-user';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> },
) {
  try {
    const user = await getListeningAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'listening.api.notAuthenticated',
      );
    }
    const { podcastId } = await params;
    const body = await req.json();
    const parsed = updateProgressSchema.safeParse(body);
    if (!parsed.success) {
      return apiErrorHandler(parsed.error, req);
    }
    const useCase = makeUpdateListeningProgressUseCase();
    const progress = await useCase.execute(
      user.id,
      podcastId,
      parsed.data.listenedPercentage,
    );
    return ProgressPresenter.success(progress);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
