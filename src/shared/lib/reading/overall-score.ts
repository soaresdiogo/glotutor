export type WordResultStatus = 'green' | 'yellow' | 'red' | 'missed';

export type WordResult = {
  status: WordResultStatus;
  expected: string;
  actual: string;
  similarity: number;
};

export type OverallScore = {
  accuracy: number;
  fluency: number;
  overall: number;
};

/**
 * Accuracy: (correct + close×0.5) / total × 100.
 * Fluency: share of reference words that were said (not missed).
 * Overall: 0.7×accuracy + 0.3×fluency.
 */
export function calculateOverallScore(results: WordResult[]): OverallScore {
  if (results.length === 0) {
    return { accuracy: 0, fluency: 0, overall: 0 };
  }
  const total = results.length;
  const correct = results.filter((r) => r.status === 'green').length;
  const close = results.filter((r) => r.status === 'yellow').length;
  const said = results.filter(
    (r) => r.actual !== '' && r.status !== 'missed',
  ).length;

  const accuracy = ((correct + close * 0.5) / total) * 100;
  const fluency = (said / total) * 100;
  const overall = accuracy * 0.7 + fluency * 0.3;

  return {
    accuracy: Math.round(accuracy),
    fluency: Math.round(fluency),
    overall: Math.round(overall),
  };
}
