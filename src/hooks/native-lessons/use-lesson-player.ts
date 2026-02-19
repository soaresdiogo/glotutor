'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { activityCompletedApi } from '@/client-api/activity-completed.api';
import {
  type LessonCompletionResult,
  type LessonExercise,
  nativeLessonsApi,
} from '@/client-api/native-lessons.api';

export type ExerciseResult = {
  isCorrect: boolean;
  score: number;
  feedback: string;
  expectedAnswer?: string;
};

export type ExerciseState = {
  status: 'idle' | 'submitted' | 'reviewing';
  currentAnswer: string | string[] | null;
  lastResult: ExerciseResult | null;
  attempts: number;
  bestScore: number;
};

function evaluateSituation(
  userAnswer: string,
  exercise: Extract<LessonExercise, { type: 'SITUATION' }>,
): ExerciseResult {
  const patterns = exercise.acceptable_patterns ?? [];
  const keyPhrases = exercise.key_phrases ?? [];
  const feedbackCorrect = exercise.feedback_correct ?? 'Good!';
  const feedbackNeeds = exercise.feedback_needs_improvement ?? 'Try again.';
  const expectedAnswer = exercise.expected_answer;

  if (patterns.length === 0) {
    const trimmed = userAnswer.trim();
    const matchesExpected =
      expectedAnswer != null &&
      trimmed.toLowerCase() === expectedAnswer.toLowerCase().trim();
    const hasAnswer = trimmed.length > 0;
    return {
      isCorrect: hasAnswer,
      score: matchesExpected ? 10 : hasAnswer ? 8 : 0,
      feedback: hasAnswer ? feedbackCorrect : feedbackNeeds,
      expectedAnswer,
    };
  }

  const normalized = userAnswer.toLowerCase().trim();
  const hasAcceptablePattern = patterns.some((p) =>
    normalized.includes(p.toLowerCase()),
  );
  const matchedKeyPhrases = keyPhrases.filter((p) =>
    normalized.includes(p.toLowerCase()),
  );

  if (!hasAcceptablePattern && matchedKeyPhrases.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      feedback: feedbackNeeds,
      expectedAnswer,
    };
  }

  if (hasAcceptablePattern) {
    const matchesExpected =
      expectedAnswer != null &&
      normalized === expectedAnswer.toLowerCase().trim();
    const allKeyPhrasesMatched =
      keyPhrases.length > 0 && matchedKeyPhrases.length === keyPhrases.length;
    const score =
      matchesExpected || allKeyPhrasesMatched
        ? 10
        : Math.min(8 + matchedKeyPhrases.length, 10);
    return {
      isCorrect: true,
      score,
      feedback: feedbackCorrect,
      expectedAnswer,
    };
  }

  return {
    isCorrect: true,
    score: 10,
    feedback: feedbackCorrect,
    expectedAnswer,
  };
}

export type TransformPair = Extract<
  LessonExercise,
  { type: 'TRANSFORM' }
>['pairs'][number];

export function evaluateTransformPair(
  pair: TransformPair,
  userAnswer: string,
): ExerciseResult {
  const ans = userAnswer.trim();
  const patterns = pair.acceptable_patterns ?? [];
  const feedbackCorrect = pair.feedback_correct ?? 'Good!';
  const feedbackNeeds = pair.feedback_needs_improvement ?? 'Try again.';
  const expectedAnswer = pair.expected_answer;

  if (patterns.length === 0) {
    return {
      isCorrect: ans.length > 0,
      score: ans.length > 0 ? 8 : 0,
      feedback: ans.length > 0 ? feedbackCorrect : feedbackNeeds,
      expectedAnswer,
    };
  }

  const normalized = ans.toLowerCase();
  const hasAcceptablePattern = patterns.some((p) =>
    normalized.includes(p.toLowerCase()),
  );

  if (!hasAcceptablePattern) {
    return {
      isCorrect: false,
      score: 0,
      feedback: feedbackNeeds,
      expectedAnswer,
    };
  }

  return {
    isCorrect: true,
    score: 8,
    feedback: feedbackCorrect,
    expectedAnswer,
  };
}

function evaluateTransform(
  userAnswers: string[],
  exercise: Extract<LessonExercise, { type: 'TRANSFORM' }>,
): ExerciseResult {
  const pairs = exercise.pairs;
  let totalScore = 0;
  const feedbacks: string[] = [];
  const expectedParts: string[] = [];

  for (let i = 0; i < pairs.length; i++) {
    const pairResult = evaluateTransformPair(
      pairs[i],
      (userAnswers[i] ?? '').trim(),
    );
    totalScore += pairResult.score;
    feedbacks.push(pairResult.feedback);
    if (pairResult.expectedAnswer)
      expectedParts.push(pairResult.expectedAnswer);
  }

  const score = pairs.length > 0 ? Math.round(totalScore / pairs.length) : 0;
  const isCorrect = score >= 6;
  const feedback = feedbacks.join(' ') || (isCorrect ? 'Good!' : 'Try again.');

  return {
    isCorrect,
    score,
    feedback,
    expectedAnswer:
      expectedParts.length > 0 ? expectedParts.join(' / ') : undefined,
  };
}

function normalizeReorderForCompare(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/[\u2018\u2019]/g, "'") // normalize curly apostrophes to straight
    .replace(/^[.,?!;:]+/, '')
    .replace(/[.,?!;:]+$/, '')
    .trim();
}

function evaluateReorder(
  exercise: Extract<LessonExercise, { type: 'REORDER' }>,
  userAnswer: string | string[],
): ExerciseResult {
  const userStr = Array.isArray(userAnswer) ? userAnswer.join(' ') : userAnswer;
  const userNormalized = normalizeReorderForCompare(userStr);
  const rawAnswer =
    typeof exercise.answer === 'string'
      ? exercise.answer
      : String(exercise.answer ?? '');
  const expectedNormalized = normalizeReorderForCompare(rawAnswer);
  const correct = userNormalized === expectedNormalized;
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bff0321-f76f-4652-8eaa-085556b0ca30', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'use-lesson-player.ts:evaluateReorder',
      message: 'REORDER compare',
      data: {
        userStr,
        userNormalized,
        rawAnswer,
        expectedNormalized,
        correct,
        userAnswerType: Array.isArray(userAnswer) ? 'array' : 'string',
      },
      timestamp: Date.now(),
      hypothesisId: 'A',
      runId: 'post-fix',
    }),
  }).catch(() => {});
  // #endregion
  return {
    isCorrect: correct,
    score: correct ? 10 : 0,
    feedback: correct ? 'Correct!' : 'Incorrect.',
    expectedAnswer: exercise.answer,
  };
}

function evaluateMatch(
  exercise: Extract<LessonExercise, { type: 'MATCH' }>,
  userAnswer: string | string[],
): ExerciseResult {
  const selected = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  const correct =
    selected.length === exercise.pairs.length &&
    exercise.pairs.every((p) => selected.includes(`${p.situation}|${p.chunk}`));
  return {
    isCorrect: correct,
    score: correct ? 10 : 0,
    feedback: correct ? 'Correct!' : 'Incorrect.',
  };
}

function evaluateChoice(
  exercise: Extract<LessonExercise, { type: 'CHOICE' }>,
  userAnswer: string | string[],
): ExerciseResult {
  const selected = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
  const option = exercise.options.find((o) => o.text === selected);
  const correct = option?.correct ?? false;
  return {
    isCorrect: correct,
    score: correct ? 10 : 0,
    feedback: correct ? 'Correct!' : 'Incorrect.',
    expectedAnswer: exercise.options.find((o) => o.correct)?.text,
  };
}

export function validateExercise(
  exercise: LessonExercise,
  userAnswer: string | string[],
): ExerciseResult {
  switch (exercise.type) {
    case 'REORDER':
      return evaluateReorder(exercise, userAnswer);
    case 'MATCH':
      return evaluateMatch(exercise, userAnswer);
    case 'CHOICE':
      return evaluateChoice(exercise, userAnswer);
    case 'SITUATION':
      return evaluateSituation(
        typeof userAnswer === 'string' ? userAnswer : (userAnswer[0] ?? ''),
        exercise,
      );
    case 'TRANSFORM':
      return evaluateTransform(
        Array.isArray(userAnswer) ? userAnswer : [userAnswer],
        exercise,
      );
    default:
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Unknown exercise type.',
      };
  }
}

function buildResultsFromStates(
  exercises: LessonExercise[],
  states: Record<number, ExerciseState>,
): LessonCompletionResult[] {
  return exercises.flatMap((ex, i) => {
    const state = states[i];
    if (!state || state.attempts === 0) return [];
    return [
      {
        exerciseIndex: i,
        type: ex.type,
        correct: state.bestScore >= 6,
        score: state.bestScore,
        userAnswer: state.currentAnswer ?? undefined,
        feedback: state.lastResult?.feedback,
        correctAnswer: state.lastResult?.expectedAnswer,
      },
    ];
  });
}

export function useLessonPlayer(lessonId: string | null) {
  const queryClient = useQueryClient();
  const [exerciseStates, setExerciseStates] = useState<
    Record<number, ExerciseState>
  >({});
  const hasHydratedFromProgress = useRef(false);

  const lessonQuery = useQuery({
    queryKey: ['native-lesson', lessonId],
    queryFn: () => {
      if (!lessonId) return Promise.reject(new Error('No lesson ID'));
      return nativeLessonsApi.getLesson(lessonId);
    },
    enabled: !!lessonId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const exercises = lessonQuery.data?.content?.exercises ?? [];
  const totalExercises = exercises.length;

  const finalScore = useMemo(() => {
    const states = Object.values(exerciseStates);
    if (totalExercises === 0) return 0;
    const totalBest = states.reduce((sum, s) => sum + s.bestScore, 0);
    return Math.round((totalBest / (totalExercises * 10)) * 100);
  }, [exerciseStates, totalExercises]);

  const allSubmittedAtLeastOnce = useMemo(() => {
    if (totalExercises === 0) return false;
    return exercises.every((_, i) => (exerciseStates[i]?.attempts ?? 0) > 0);
  }, [exercises, exerciseStates, totalExercises]);

  const completedCount = useMemo(
    () => Object.values(exerciseStates).filter((s) => s.attempts > 0).length,
    [exerciseStates],
  );
  const progressPercent =
    totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  // Restore from saved progress; clear when redo (in_progress, no results)
  useEffect(() => {
    if (!lessonId) {
      hasHydratedFromProgress.current = false;
      return;
    }
    const lesson = lessonQuery.data;
    if (!lesson?.progress) return;

    const status = lesson.progress.status;
    const results = lesson.progress.exerciseResults as
      | LessonCompletionResult[]
      | null
      | undefined;

    if (
      status === 'in_progress' &&
      (!results || !Array.isArray(results) || results.length === 0)
    ) {
      setExerciseStates({});
      hasHydratedFromProgress.current = false;
      return;
    }

    if (
      !Array.isArray(results) ||
      results.length === 0 ||
      hasHydratedFromProgress.current
    )
      return;
    const next: Record<number, ExerciseState> = {};
    for (const r of results) {
      next[r.exerciseIndex] = {
        status: 'reviewing',
        currentAnswer: r.userAnswer ?? null,
        lastResult: {
          isCorrect: r.correct ?? false,
          score: r.score ?? 0,
          feedback: r.feedback ?? '',
          expectedAnswer: Array.isArray(r.correctAnswer)
            ? r.correctAnswer.join(' / ')
            : r.correctAnswer,
        },
        attempts: 1,
        bestScore: r.score ?? 0,
      };
    }
    setExerciseStates(next);
    hasHydratedFromProgress.current = true;
  }, [lessonId, lessonQuery.data]);

  useEffect(() => {
    if (!lessonId) return;
    hasHydratedFromProgress.current = false;
  }, [lessonId]);

  const startMutation = useMutation({
    mutationFn: () => {
      if (!lessonId) return Promise.reject(new Error('No lesson ID'));
      return nativeLessonsApi.startLesson(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['native-lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['native-lessons'] });
      queryClient.invalidateQueries({
        queryKey: ['native-lessons', 'daily-limit'],
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (results: LessonCompletionResult[]) => {
      if (!lessonId) return Promise.reject(new Error('No lesson ID'));
      return nativeLessonsApi.completeLesson(lessonId, results);
    },
    onSuccess: () => {
      const lesson = lessonQuery.data;
      if (lesson?.language && lesson?.level) {
        activityCompletedApi
          .complete({
            language: lesson.language,
            cefrLevel: lesson.level,
            activityType: 'lesson',
            durationMinutes: 0,
          })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['level-progress'] });
            queryClient.invalidateQueries({ queryKey: ['user-languages'] });
            queryClient.invalidateQueries({
              queryKey: ['user-languages-check'],
            });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
          })
          .catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ['native-lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['native-lessons'] });
      queryClient.invalidateQueries({
        queryKey: ['native-lessons', 'daily-limit'],
      });
    },
  });

  const redoMutation = useMutation({
    mutationFn: () => {
      if (!lessonId) return Promise.reject(new Error('No lesson ID'));
      return nativeLessonsApi.redoLesson(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['native-lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['native-lessons'] });
    },
  });

  const setExerciseAnswer = useCallback(
    (index: number, _userAnswer: string | string[]) => {
      setExerciseStates((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          status: 'idle',
          currentAnswer: prev[index]?.currentAnswer ?? null,
          lastResult: prev[index]?.lastResult ?? null,
          attempts: prev[index]?.attempts ?? 0,
          bestScore: prev[index]?.bestScore ?? 0,
          // Treat as "draft" - we don't store draft in state; components hold local state until submit
        },
      }));
    },
    [],
  );

  const submitExercise = useCallback(
    (
      exerciseIndex: number,
      exercise: LessonExercise,
      userAnswer: string | string[],
    ) => {
      const result = validateExercise(exercise, userAnswer);
      setExerciseStates((prev) => {
        const current = prev[exerciseIndex] ?? {
          status: 'idle' as const,
          currentAnswer: null,
          lastResult: null,
          attempts: 0,
          bestScore: 0,
        };
        const newBest = Math.max(current.bestScore, result.score);
        return {
          ...prev,
          [exerciseIndex]: {
            status: 'reviewing' as const,
            currentAnswer: userAnswer,
            lastResult: result,
            attempts: current.attempts + 1,
            bestScore: newBest,
          },
        };
      });
      return result.isCorrect;
    },
    [],
  );

  const retryExercise = useCallback((exerciseIndex: number) => {
    setExerciseStates((prev) => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        status: 'idle',
        currentAnswer: null,
        lastResult: null,
        attempts: prev[exerciseIndex]?.attempts ?? 0,
        bestScore: prev[exerciseIndex]?.bestScore ?? 0,
      },
    }));
  }, []);

  const saveAndExit = useCallback(async () => {
    const results = buildResultsFromStates(exercises, exerciseStates);
    await completeMutation.mutateAsync(results);
  }, [exercises, exerciseStates, completeMutation]);

  return {
    lesson: lessonQuery.data ?? null,
    isLoading: lessonQuery.isPending,
    isError: lessonQuery.isError,
    error: lessonQuery.error,
    startLesson: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    exerciseStates,
    setExerciseAnswer,
    submitExercise,
    retryExercise,
    completedCount,
    totalExercises,
    progressPercent,
    allSubmittedAtLeastOnce,
    finalScore,
    saveAndExit,
    isSaving: completeMutation.isPending,
    redoLesson: redoMutation.mutateAsync,
    isRedoing: redoMutation.isPending,
  };
}
