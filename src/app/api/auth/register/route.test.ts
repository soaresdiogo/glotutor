import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/features/auth/application/factories/register.factory', () => ({
  makeRegisterUseCase: vi.fn(),
}));

vi.mock('@/infrastructure/db/client', () => ({
  db: {
    query: {
      supportedLanguages: {
        findFirst: vi.fn().mockResolvedValue({ id: 'default-lang-id' }),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

const makeRegisterUseCase = vi.mocked(
  await import('@/features/auth/application/factories/register.factory'),
).makeRegisterUseCase;

function createRequest(body: object) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 201 with userId and email when registration succeeds', async () => {
    const execute = vi
      .fn()
      .mockResolvedValue({ userId: 'user-1', email: 'new@example.com' });
    makeRegisterUseCase.mockReturnValue({ execute } as never);

    const res = await POST(
      createRequest({
        name: 'New User',
        email: 'new@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      }),
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toMatchObject({
      message: 'Account created successfully.',
      userId: 'user-1',
      email: 'new@example.com',
    });
    expect(execute).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
  });

  it('should return 400 when validation fails', async () => {
    const res = await POST(
      createRequest({
        email: 'bad',
        password: 'short',
        confirmPassword: 'mismatch',
      }),
    );

    expect(res.status).toBe(400);
  });
});
