import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';

import { AppError } from './errors';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from './translate-api-message';

export function apiErrorHandler(
  error: unknown,
  req?: NextRequest,
): NextResponse {
  if (error instanceof ZodError) {
    const { fieldErrors } = z.flattenError(error);
    const firstMessage = Object.values(fieldErrors).flat()[0];
    const locale = req ? getLocaleFromRequest(req) : 'en';
    const fallback = translateApiMessage(locale, 'errors.validationFailed');
    return NextResponse.json(
      {
        message: typeof firstMessage === 'string' ? firstMessage : fallback,
        errors: fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    const message =
      req && error.messageKey
        ? translateApiMessage(getLocaleFromRequest(req), error.messageKey)
        : error.message;
    return NextResponse.json(
      { message, code: error.code },
      { status: error.statusCode },
    );
  }

  console.error('Unhandled API error:', error);
  const locale = req ? getLocaleFromRequest(req) : 'en';
  const message = translateApiMessage(locale, 'errors.internalServerError');
  return NextResponse.json({ message }, { status: 500 });
}
