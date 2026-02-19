import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeVerifyMfaUseCase } from '@/features/auth/application/factories/verify-mfa.factory';
import { LoginPresenter } from '@/features/auth/infrastructure/presenters/login.presenter';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';

const VerifyMfaSchema = z.object({
  sessionId: z.uuid(),
  mfaCode: z.string().trim().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const data = VerifyMfaSchema.parse(await req.json());

    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip =
      forwardedFor?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '::1';

    const verifyMfaUseCase = makeVerifyMfaUseCase();
    const tokens = await verifyMfaUseCase.execute({
      sessionId: data.sessionId,
      mfaCode: data.mfaCode,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? '',
    });

    return LoginPresenter.success(tokens);
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
