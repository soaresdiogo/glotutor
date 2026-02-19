import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock(
  '@/features/auth/application/factories/refresh-auth-token.factory',
  () => ({
    makeRefreshAuthTokenUseCase: vi.fn(),
  }),
);

const makeRefreshAuthTokenUseCase = vi.mocked(
  await import(
    '@/features/auth/application/factories/refresh-auth-token.factory'
  ),
).makeRefreshAuthTokenUseCase;

function createRequest(cookieValue?: string): NextRequest {
  const req = new Request('http://localhost/api/auth/refresh', {
    method: 'POST',
  });
  const cookies = {
    get: (name: string) =>
      name === 'refreshToken' && cookieValue !== undefined
        ? { name, value: cookieValue }
        : undefined,
  };
  return Object.assign(req, { cookies }) as NextRequest;
}

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when refresh token cookie is missing', async () => {
    const res = await POST(createRequest());

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toContain('Refresh token');
  });

  it('should return 200 with accessToken when refresh succeeds', async () => {
    const execute = vi.fn().mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    makeRefreshAuthTokenUseCase.mockReturnValue({ execute } as never);

    const res = await POST(createRequest('cookie-refresh-token'));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.accessToken).toBe('new-access');
    expect(execute).toHaveBeenCalledWith('cookie-refresh-token');
  });
});
