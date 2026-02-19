import type { NextRequest } from 'next/server';

import { GetWordDetailsSchema } from '@/features/reading/application/dto/get-word-details.dto';
import { makeGetWordDetailsUseCase } from '@/features/reading/application/factories/get-word-details.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import { BadRequestError, UnauthorizedError } from '@/shared/lib/errors';
import { getTenantFromRequest } from '@/shared/lib/require-tenant';

import { getReadingAuthUser } from '../get-auth-user';

export async function POST(req: NextRequest) {
  try {
    await getTenantFromRequest(req);
    const user = await getReadingAuthUser(req);
    if (!user) {
      throw new UnauthorizedError(
        'Not authenticated.',
        'reading.api.notAuthenticated',
      );
    }

    const body = await req.json();
    const parsed = GetWordDetailsSchema.safeParse({
      word: body.word ?? '',
      textLanguageCode: body.textLanguageCode ?? 'en',
    });
    if (!parsed.success) {
      throw new BadRequestError('Missing word.', 'reading.api.missingWord');
    }
    const dto = parsed.data;
    if (!dto.word) {
      throw new BadRequestError('Missing word.', 'reading.api.missingWord');
    }

    const useCase = makeGetWordDetailsUseCase();
    const result = await useCase.execute(user.id, dto);
    return Response.json(result);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
