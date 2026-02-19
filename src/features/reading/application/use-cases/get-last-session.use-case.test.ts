import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetLastSessionUseCase } from './get-last-session.use-case';

const mockSessionRepo = {
  findLatestCompletedByUserAndText: vi.fn(),
};

describe('GetLastSessionUseCase', () => {
  let useCase: GetLastSessionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetLastSessionUseCase(mockSessionRepo as never);
  });

  it('should return null when no session exists', async () => {
    mockSessionRepo.findLatestCompletedByUserAndText.mockResolvedValue(null);

    const result = await useCase.execute('user-1', {
      textId: '00000000-0000-0000-0000-000000000001',
    });

    expect(result).toBeNull();
    expect(
      mockSessionRepo.findLatestCompletedByUserAndText,
    ).toHaveBeenCalledWith('user-1', '00000000-0000-0000-0000-000000000001');
  });

  it('should return session when one exists', async () => {
    const session = {
      sessionId: 'session-1',
      wordScores: [],
      metrics: {
        wpm: 100,
        accuracy: 90,
        duration: 60,
        greenCount: 10,
        yellowCount: 1,
        redCount: 0,
        missedCount: 0,
      },
      feedback: { summary: 'Good', tips: [], focusWords: [], nextSteps: [] },
      grammarItems: [],
    };
    mockSessionRepo.findLatestCompletedByUserAndText.mockResolvedValue(session);

    const result = await useCase.execute('user-1', { textId: 'text-1' });

    expect(result).toEqual(session);
  });
});
