import type { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/logout', () => {
  it('should return 200 and clear refreshToken cookie', async () => {
    const req = new Request('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { 'Accept-Language': 'en' },
    }) as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ message: 'Logged out successfully.' });
    const setCookie = res.headers.get('Set-Cookie');
    expect(setCookie).toContain('refreshToken=');
    expect(setCookie).toContain('Max-Age=0');
  });
});
