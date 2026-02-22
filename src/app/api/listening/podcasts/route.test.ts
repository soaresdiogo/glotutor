import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from './route';

vi.mock('@/shared/lib/require-tenant', () => ({
  getTenantFromRequest: vi
    .fn()
    .mockResolvedValue({ id: 'tenant-1', name: 'Test' }),
}));

vi.mock('../get-auth-user', () => ({
  getListeningAuthUser: vi.fn(),
}));

const getListeningAuthUser = vi.mocked(
  await import('../get-auth-user'),
).getListeningAuthUser;

vi.mock(
  '@/features/listening/application/factories/get-podcast-list.factory',
  () => ({
    makeGetPodcastListUseCase: vi.fn(),
  }),
);

const makeGetPodcastListUseCase = vi.mocked(
  await import(
    '@/features/listening/application/factories/get-podcast-list.factory'
  ),
).makeGetPodcastListUseCase;

describe('GET /api/listening/podcasts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    getListeningAuthUser.mockResolvedValue(null);

    const req = new Request('http://localhost/api/listening/podcasts', {
      headers: { 'Accept-Language': 'en' },
    });
    const res = await GET(req as NextRequest);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toBeDefined();
  });

  it('should return 200 with podcasts when authenticated', async () => {
    getListeningAuthUser.mockResolvedValue({
      id: 'user-1',
      name: 'Test',
      email: 'test@example.com',
    });
    const execute = vi
      .fn()
      .mockResolvedValue([{ id: 'p1', title: 'Podcast 1' }]);
    makeGetPodcastListUseCase.mockReturnValue({ execute } as never);

    const url = new URL('http://localhost/api/listening/podcasts');
    const req = Object.assign(new Request(url), {
      nextUrl: url,
    }) as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.podcasts).toHaveLength(1);
    expect(data.podcasts[0].title).toBe('Podcast 1');
    expect(execute).toHaveBeenCalledWith('user-1', {
      language: undefined,
      level: undefined,
    });
  });
});
