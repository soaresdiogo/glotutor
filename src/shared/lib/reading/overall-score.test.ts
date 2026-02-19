import { describe, expect, it } from 'vitest';
import { calculateOverallScore } from './overall-score';

describe('overall-score', () => {
  it('returns zeros for empty results', () => {
    expect(calculateOverallScore([])).toEqual({
      accuracy: 0,
      fluency: 0,
      overall: 0,
    });
  });

  it('calculates accuracy as (correct + close*0.5)/total and fluency from words said', () => {
    const results = [
      { status: 'green' as const, expected: 'a', actual: 'a', similarity: 1 },
      {
        status: 'yellow' as const,
        expected: 'b',
        actual: 'b',
        similarity: 0.8,
      },
      { status: 'red' as const, expected: 'c', actual: 'x', similarity: 0.3 },
      { status: 'missed' as const, expected: 'd', actual: '', similarity: 0 },
    ];
    const score = calculateOverallScore(results);
    expect(score.accuracy).toBe(Math.round(((1 + 0.5 + 0 + 0) / 4) * 100));
    expect(score.fluency).toBe(75);
    expect(score.overall).toBeGreaterThanOrEqual(0);
  });
});
