import { asc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { RegisterSchema } from '@/features/auth/application/dto/register.dto';
import { makeRegisterUseCase } from '@/features/auth/application/factories/register.factory';
import { db } from '@/infrastructure/db/client';
import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import { apiErrorHandler } from '@/shared/lib/api-error-handler';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

export async function POST(req: NextRequest) {
  try {
    const dto = RegisterSchema.parse(await req.json());
    const registerUseCase = makeRegisterUseCase();
    const { userId, email } = await registerUseCase.execute(dto);

    const defaultLang = await db.query.supportedLanguages.findFirst({
      where: eq(supportedLanguages.isActive, true),
      orderBy: [asc(supportedLanguages.code)],
      columns: { id: true },
    });
    if (defaultLang) {
      await db.insert(studentProfiles).values({
        userId,
        targetLanguageId: defaultLang.id,
        nativeLanguageCode: 'pt-BR',
        currentLevel: 'A1',
      });
    }

    const message = translateApiMessage(
      getLocaleFromRequest(req),
      'auth.accountCreatedSuccessfully',
    );
    return NextResponse.json({ message, userId, email }, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error, req);
  }
}
