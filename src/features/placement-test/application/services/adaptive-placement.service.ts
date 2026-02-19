import {
  CEFR_LEVEL_ORDER,
  getNextLevel,
  getPreviousLevel,
  PLACEMENT_MAX_QUESTIONS,
  PLACEMENT_MIN_QUESTIONS_PER_LEVEL,
  PLACEMENT_PERFECT_SCORE_TO_SKIP,
  PLACEMENT_THRESHOLD_CORRECT_PERCENT,
} from '@/features/placement-test/domain/constants/cefr-levels';

export type LevelStats = {
  answered: number;
  correct: number;
};

/**
 * Decides the recommended level and whether the test should continue.
 * Returns { done: true, recommendedLevel } or { done: false, nextLevel }.
 */
export function getAdaptiveDecision(
  answersByLevel: Map<string, LevelStats>,
  currentLevel: string,
  totalAnswered: number,
):
  | { done: true; recommendedLevel: string }
  | { done: false; nextLevel: string } {
  if (totalAnswered >= PLACEMENT_MAX_QUESTIONS) {
    const recommended = computeRecommendedLevel(answersByLevel, currentLevel);
    return { done: true, recommendedLevel: recommended };
  }

  const stats = answersByLevel.get(currentLevel) ?? { answered: 0, correct: 0 };

  if (stats.answered >= PLACEMENT_MIN_QUESTIONS_PER_LEVEL) {
    const percent =
      stats.answered === 0 ? 0 : (stats.correct / stats.answered) * 100;
    if (percent >= PLACEMENT_THRESHOLD_CORRECT_PERCENT) {
      const next = getNextLevel(currentLevel);
      if (!next) {
        return {
          done: true,
          recommendedLevel: currentLevel,
        };
      }
      return { done: false, nextLevel: next };
    }
    const prev = getPreviousLevel(currentLevel);
    return {
      done: true,
      recommendedLevel: prev ?? CEFR_LEVEL_ORDER[0],
    };
  }

  if (
    stats.answered >= PLACEMENT_PERFECT_SCORE_TO_SKIP &&
    stats.correct === stats.answered &&
    stats.correct >= PLACEMENT_PERFECT_SCORE_TO_SKIP
  ) {
    const next = getNextLevel(currentLevel);
    if (!next) {
      return { done: true, recommendedLevel: currentLevel };
    }
    return { done: false, nextLevel: next };
  }

  return { done: false, nextLevel: currentLevel };
}

function computeRecommendedLevel(
  answersByLevel: Map<string, LevelStats>,
  _currentLevel: string,
): string {
  const levels = [...CEFR_LEVEL_ORDER];
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    const stats = answersByLevel.get(level);
    if (!stats || stats.answered === 0) continue;
    const percent = (stats.correct / stats.answered) * 100;
    if (percent >= PLACEMENT_THRESHOLD_CORRECT_PERCENT) {
      return level;
    }
  }
  return levels[0];
}

export function buildAnswersByLevel(
  answers: { cefrLevel: string; isCorrect: boolean }[],
): Map<string, LevelStats> {
  const map = new Map<string, LevelStats>();
  for (const a of answers) {
    const cur = map.get(a.cefrLevel) ?? { answered: 0, correct: 0 };
    map.set(a.cefrLevel, {
      answered: cur.answered + 1,
      correct: cur.correct + (a.isCorrect ? 1 : 0),
    });
  }
  return map;
}
