import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/features/auth/application/factories/verify-mfa.factory', () => ({
  makeVerifyMfaUseCase: vi.fn(),
}));

const makeVerifyMfaUseCase = vi.mocked(
  await import('@/features/auth/application/factories/verify-mfa.factory'),
).makeVerifyMfaUseCase;

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/verify-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/auth/verify-mfa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with accessToken and set cookie when code is valid', async () => {
    const execute = vi.fn().mockResolvedValue({
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });
    makeVerifyMfaUseCase.mockReturnValue({ execute } as never);

    const res = await POST(
      createRequest({
        sessionId: '00000000-0000-0000-0000-000000000000',
        mfaCode: '123456',
      }),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.accessToken).toBe('access-123');
    expect(res.headers.get('Set-Cookie')).toContain('refreshToken=');
    expect(execute).toHaveBeenCalled();
  });

  it('should return 400 when body is invalid', async () => {
    const res = await POST(
      createRequest({
        sessionId: 'not-a-uuid',
        mfaCode: '12',
      }),
    );

    expect(res.status).toBe(400);
  });
});
