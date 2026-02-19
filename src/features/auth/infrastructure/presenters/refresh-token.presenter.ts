import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import { REFRESH_EXPIRES_SECONDS } from '@/shared/lib/auth/refresh-expiration';

export const RefreshTokenPresenter = {
  missingToken() {
    return NextResponse.json(
      { message: 'Refresh token is required.' },
      { status: 401 },
    );
  },

  success(accessToken: string, refreshToken?: string) {
    const body: { accessToken: string } = { accessToken };
    const response = NextResponse.json(body);

    if (refreshToken) {
      const cookie = serialize('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_EXPIRES_SECONDS,
      });
      response.headers.set('Set-Cookie', cookie);
    }

    return response;
  },
};
