import { serialize } from 'cookie';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getLocaleFromRequest,
  translateApiMessage,
} from '@/shared/lib/translate-api-message';

export async function POST(req: NextRequest) {
  const cookie = serialize('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  const locale = getLocaleFromRequest(req);
  const message = translateApiMessage(locale, 'auth.loggedOutSuccessfully');
  const response = NextResponse.json({ message }, { status: 200 });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
