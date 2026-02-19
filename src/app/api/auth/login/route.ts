import type { NextRequest } from 'next/server';
import { LoginSchema } from '@/features/auth/application/dto/login.dto';
import { makeInitiateMfaUseCase } from '@/features/auth/application/factories/initiate-mfa.factory';
import { LoginPresenter } from '@/features/auth/infrastructure/presenters/login.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const credentials = LoginSchema.parse(await req.json());
    const initiateMfaUseCase = makeInitiateMfaUseCase();
    const { sessionId } = await initiateMfaUseCase.execute(credentials);
    return LoginPresenter.mfaRequired(sessionId);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
