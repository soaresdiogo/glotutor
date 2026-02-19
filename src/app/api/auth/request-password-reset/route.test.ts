import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock(
  '@/features/auth/application/factories/request-password-reset.factory',
  () => ({
    makeRequestPasswordResetUseCase: vi.fn(),
  }),
);

const makeRequestPasswordResetUseCase = vi.mocked(
  await import(
    '@/features/auth/application/factories/request-password-reset.factory'
  ),
).makeRequestPasswordResetUseCase;

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/request-password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/auth/request-password-reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 and call use case with email', async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    makeRequestPasswordResetUseCase.mockReturnValue({ execute } as never);

    const res = await POST(createRequest({ email: 'user@example.com' }));

    expect(res.status).toBe(200);
    expect(execute).toHaveBeenCalledWith('user@example.com');
    const data = await res.json();
    expect(data.message).toBeDefined();
  });

  it('should return 400 when email is invalid', async () => {
    const res = await POST(createRequest({ email: 'not-an-email' }));

    expect(res.status).toBe(400);
  });
});
