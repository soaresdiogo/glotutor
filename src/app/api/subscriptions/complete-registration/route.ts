import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { CompleteRegistrationSchema } from '@/features/subscriptions/application/dto/complete-registration.dto';
import { makeCompleteRegistrationUseCase } from '@/features/subscriptions/application/factories/complete-registration.factory';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const dto = CompleteRegistrationSchema.parse(await req.json());
    const result = await makeCompleteRegistrationUseCase().execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
