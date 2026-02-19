import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NotFoundError } from '@/shared/lib/errors';

import { EvaluateReadingUseCase } from './evaluate-reading.use-case';

const mockTextRepo = {
  findContentById: vi.fn(),
};
const mockTranscriptionService = {
  transcribe: vi.fn(),
};
const mockSessionRepo = {
  create: vi.fn(),
};
const mockDailyProgressRepo = {
  addReadingProgress: vi.fn(),
};

describe('EvaluateReadingUseCase', () => {
  let useCase: EvaluateReadingUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new EvaluateReadingUseCase(
      mockTextRepo as never,
      mockTranscriptionService as never,
      mockSessionRepo as never,
      mockDailyProgressRepo as never,
    );
  });

  it('should throw NotFoundError with messageKey when text is not found', async () => {
    mockTextRepo.findContentById.mockResolvedValue(null);

    const dto = {
      textId: '00000000-0000-0000-0000-000000000001',
      audio: new Blob(['fake-audio'], { type: 'audio/webm' }),
    };

    const err = await useCase.execute('user-1', dto).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe('NotFoundError');
    expect((err as NotFoundError).messageKey).toBe('reading.api.textNotFound');
  });
});
