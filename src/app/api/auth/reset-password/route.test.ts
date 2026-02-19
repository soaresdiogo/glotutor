import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock(
  '@/features/auth/application/factories/reset-password-with-token.factory',
  () => ({
    makeResetPasswordWithTokenUseCase: vi.fn(),
  }),
);

const makeResetPasswordWithTokenUseCase = vi.mocked(
  await import(
    '@/features/auth/application/factories/reset-password-with-token.factory'
  ),
).makeResetPasswordWithTokenUseCase;

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 when token and password are valid', async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    makeResetPasswordWithTokenUseCase.mockReturnValue({ execute } as never);

    const res = await POST(
      createRequest({
        token: 'valid-token',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      }),
    );

    expect(res.status).toBe(200);
    expect(execute).toHaveBeenCalledWith({
      token: 'valid-token',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    });
  });

  it('should return 400 when passwords do not match', async () => {
    const res = await POST(
      createRequest({
        token: 't',
        newPassword: 'pass1',
        confirmPassword: 'pass2',
      }),
    );

    expect(res.status).toBe(400);
  });
});
