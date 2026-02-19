import { describe, expect, it } from 'vitest';
import { scoreWord } from './pronunciation-scorer';

describe('pronunciation-scorer', () => {
  it('returns missed when spoken is empty or status missed', () => {
    expect(
      scoreWord('hello', { word: '', confidence: 0, status: 'missed' }),
    ).toEqual({
      status: 'missed',
      similarity: 0,
      confidence: 0,
      phoneticMatch: false,
      combinedScore: 0,
    });
    const emptyWord = scoreWord('hello', { word: '', confidence: 0.9 });
    expect(emptyWord.status).toBe('missed');
    expect(emptyWord.similarity).toBe(0);
    expect(emptyWord.phoneticMatch).toBe(false);
    expect(emptyWord.combinedScore).toBe(0);
  });

  it('returns green for exact match (blind comparison)', () => {
    const r = scoreWord('hello', { word: 'hello', confidence: 0.95 });
    expect(r.status).toBe('green');
    expect(r.similarity).toBe(1);
    expect(r.combinedScore).toBe(1);
  });

  it('returns yellow when similarity >= 0.6 (close)', () => {
    const r = scoreWord('recommendation', {
      word: 'recomendation',
      confidence: 0.58,
    });
    expect(r.status).toBe('yellow');
    expect(r.similarity).toBeGreaterThanOrEqual(0.6);
  });

  it('returns red when similarity < 0.6 (incorrect)', () => {
    const r = scoreWord('artificial', { word: 'art', confidence: 0.9 });
    expect(r.status).toBe('red');
    expect(r.similarity).toBeLessThan(0.6);
  });

  it('normalizes expected word (strips punctuation)', () => {
    const r = scoreWord("don't", { word: 'dont', confidence: 0.9 });
    expect(r.status).toBe('green');
  });
});
