import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/features/auth/application/factories/initiate-mfa.factory', () => ({
  makeInitiateMfaUseCase: vi.fn(),
}));

const makeInitiateMfaUseCase = vi.mocked(
  await import('@/features/auth/application/factories/initiate-mfa.factory'),
).makeInitiateMfaUseCase;

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with sessionId and requiresMfa when credentials valid', async () => {
    const execute = vi.fn().mockResolvedValue({ sessionId: 'sess-123' });
    makeInitiateMfaUseCase.mockReturnValue({ execute } as never);

    const res = await POST(
      createRequest({
        email: 'user@example.com',
        password: 'password123',
      }),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ sessionId: 'sess-123', requiresMfa: true });
    expect(execute).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('should return 400 when body is invalid', async () => {
    const res = await POST(createRequest({ email: 'bad' }));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBeDefined();
  });
});
