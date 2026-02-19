import { describe, expect, it } from 'vitest';
import { alignWords } from './word-alignment';

describe('word-alignment', () => {
  it('aligns when spoken matches expected order', () => {
    const expected = ['hello', 'world'];
    const spoken = [
      { word: 'hello', start: 0, end: 0.5, confidence: 0.9 },
      { word: 'world', start: 0.5, end: 1, confidence: 0.9 },
    ];
    const result = alignWords(expected, spoken);
    expect(result).toHaveLength(2);
    expect(result[0].word).toBe('hello');
    expect(result[0].status).toBeUndefined();
    expect(result[1].word).toBe('world');
    expect(result[1].status).toBeUndefined();
  });

  it('marks word as missed when not in next few spoken', () => {
    const expected = ['hello', 'world', 'again'];
    const spoken = [
      { word: 'hello', start: 0, end: 0.5, confidence: 0.9 },
      { word: 'again', start: 1, end: 1.5, confidence: 0.9 },
    ];
    const result = alignWords(expected, spoken);
    expect(result).toHaveLength(3);
    expect(result[0].word).toBe('hello');
    expect(result[1].status).toBe('missed');
    expect(result[1].word).toBe('');
    expect(result[2].word).toBe('again');
  });

  it('matches with typo when similarity above threshold', () => {
    const expected = ['the', 'quick', 'brown'];
    const spoken = [
      { word: 'the', start: 0, end: 0.2, confidence: 0.95 },
      { word: 'quik', start: 0.2, end: 0.5, confidence: 0.8 },
      { word: 'brown', start: 0.5, end: 0.8, confidence: 0.9 },
    ];
    const result = alignWords(expected, spoken);
    expect(result[0].word).toBe('the');
    expect(result[1].word).toBe('quik');
    expect(result[2].word).toBe('brown');
  });
});
