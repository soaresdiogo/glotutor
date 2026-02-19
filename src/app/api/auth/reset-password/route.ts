import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ResetPasswordWithTokenSchema } from '@/features/auth/application/dto/reset-password-with-token.dto';
import { makeResetPasswordWithTokenUseCase } from '@/features/auth/application/factories/reset-password-with-token.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

export async function POST(req: NextRequest) {
  try {
    const dto = ResetPasswordWithTokenSchema.parse(await req.json());
    const resetPasswordUseCase = makeResetPasswordWithTokenUseCase();
    await resetPasswordUseCase.execute(dto);
    const message = translateApiMessage(
      getLocaleFromRequest(req),
      'auth.passwordResetSuccessfully',
    );
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
