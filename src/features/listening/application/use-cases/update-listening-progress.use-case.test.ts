import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateListeningProgressUseCase } from './update-listening-progress.use-case';

const mockPodcastRepo = {
  findById: vi.fn(),
  findManyByLanguageAndLevel: vi.fn(),
  findDetailById: vi.fn(),
  findLanguageIdByCode: vi.fn(),
  create: vi.fn(),
  createExercises: vi.fn(),
};

const mockProgressRepo = {
  findByUserAndPodcast: vi.fn(),
  upsertProgress: vi.fn(),
  updateExerciseResults: vi.fn(),
};

describe('UpdateListeningProgressUseCase', () => {
  let useCase: UpdateListeningProgressUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateListeningProgressUseCase(
      mockPodcastRepo as never,
      mockProgressRepo as never,
    );
  });

  it('should throw NotFoundError when podcast does not exist', async () => {
    mockPodcastRepo.findById.mockResolvedValue(null);

    const err = await useCase
      .execute('user-1', 'podcast-1', 50)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe('NotFoundError');
    expect(mockProgressRepo.upsertProgress).not.toHaveBeenCalled();
  });

  it('should call upsertProgress with clamped percentage', async () => {
    mockPodcastRepo.findById.mockResolvedValue({ id: 'podcast-1' });
    mockProgressRepo.upsertProgress.mockResolvedValue({
      id: 'prog-1',
      userId: 'user-1',
      podcastId: 'podcast-1',
      listenedPercentage: 100,
      completedAt: new Date(),
      exerciseScore: null,
      exerciseCompletedAt: null,
      exerciseAnswers: null,
      exerciseFeedback: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await useCase.execute('user-1', 'podcast-1', 150);

    expect(mockProgressRepo.upsertProgress).toHaveBeenCalledWith(
      'user-1',
      'podcast-1',
      100,
    );
  });
});
