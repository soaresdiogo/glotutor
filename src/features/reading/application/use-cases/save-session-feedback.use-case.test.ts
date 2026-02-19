import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NotFoundError } from '@/shared/lib/errors';

import { SaveSessionFeedbackUseCase } from './save-session-feedback.use-case';

const mockSessionRepo = {
  updateFeedback: vi.fn(),
};

describe('SaveSessionFeedbackUseCase', () => {
  let useCase: SaveSessionFeedbackUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SaveSessionFeedbackUseCase(mockSessionRepo as never);
  });

  it('should throw NotFoundError with messageKey when session is not found', async () => {
    mockSessionRepo.updateFeedback.mockResolvedValue(false);

    const dto = {
      sessionId: '00000000-0000-0000-0000-000000000001',
      feedback: { summary: 'Good', tips: [], focusWords: [], nextSteps: [] },
      grammarItems: [],
    };

    const err = await useCase.execute('user-1', dto).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).name).toBe('NotFoundError');
    expect((err as NotFoundError).messageKey).toBe(
      'reading.api.sessionNotFound',
    );
  });

  it('should complete when update succeeds', async () => {
    mockSessionRepo.updateFeedback.mockResolvedValue(true);

    const dto = {
      sessionId: 'session-1',
      feedback: { summary: 'Good', tips: [], focusWords: [], nextSteps: [] },
      grammarItems: [],
    };

    await expect(useCase.execute('user-1', dto)).resolves.toBeUndefined();
    expect(mockSessionRepo.updateFeedback).toHaveBeenCalledWith(
      'session-1',
      'user-1',
      dto.feedback,
      dto.grammarItems,
    );
  });
});
