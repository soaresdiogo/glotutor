import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import { REFRESH_EXPIRES_SECONDS } from '@/shared/lib/auth/refresh-expiration';

export const LoginPresenter = {
  mfaRequired(sessionId: string) {
    return NextResponse.json({ sessionId, requiresMfa: true }, { status: 200 });
  },

  success(tokens: { accessToken: string; refreshToken: string }) {
    const cookie = serialize('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_EXPIRES_SECONDS,
    });

    const response = NextResponse.json({ accessToken: tokens.accessToken });
    response.headers.set('Set-Cookie', cookie);
    return response;
  },
};
