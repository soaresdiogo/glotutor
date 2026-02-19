import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetPodcastListUseCase } from './get-podcast-list.use-case';

const mockPodcastRepo = {
  findManyByLanguageAndLevel: vi.fn(),
  findLanguageIdByCode: vi.fn(),
  findDetailById: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  createExercises: vi.fn(),
};

const mockProfileProvider = {
  getProfile: vi.fn(),
};

describe('GetPodcastListUseCase', () => {
  let useCase: GetPodcastListUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetPodcastListUseCase(
      mockPodcastRepo as never,
      mockProfileProvider as never,
    );
  });

  it('should throw NotFoundError when profile is null', async () => {
    mockProfileProvider.getProfile.mockResolvedValue(null);

    const err = await useCase.execute('user-1').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe('NotFoundError');
    expect(mockPodcastRepo.findManyByLanguageAndLevel).not.toHaveBeenCalled();
  });

  it('should return list from repo when profile exists', async () => {
    mockProfileProvider.getProfile.mockResolvedValue({
      languageCode: 'en',
      cefrLevel: 'A1',
      nativeLanguageCode: 'pt',
    });
    const list = [
      {
        id: 'p1',
        title: 'Test',
        description: 'Desc',
        languageCode: 'en',
        cefrLevel: 'A1',
        durationSeconds: 120,
        createdAt: new Date(),
      },
    ];
    mockPodcastRepo.findManyByLanguageAndLevel.mockResolvedValue(list);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(list);
    expect(mockPodcastRepo.findManyByLanguageAndLevel).toHaveBeenCalledWith(
      'en',
      'A1',
      'user-1',
    );
  });
});
