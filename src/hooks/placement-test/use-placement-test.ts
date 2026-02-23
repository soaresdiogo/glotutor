'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { PlacementQuestion } from '@/client-api/placement-test.api';
import { placementTestApi } from '@/client-api/placement-test.api';
import { userLanguagesApi } from '@/client-api/user-languages.api';

export type PlacementTestPhase =
  | 'intro'
  | 'question'
  | 'result'
  | 'level-select';

export type PlacementTestState = {
  phase: PlacementTestPhase;
  language: string;
  attemptId: string | null;
  totalQuestions: number;
  questionsAnswered: number;
  currentQuestion: PlacementQuestion | null;
  recommendedLevel: string | null;
  selectedLevel: string | null;
  error: string | null;
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function usePlacementTest(language: string) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PlacementTestState>({
    phase: 'intro',
    language,
    attemptId: null,
    totalQuestions: 20,
    questionsAnswered: 0,
    currentQuestion: null,
    recommendedLevel: null,
    selectedLevel: null,
    error: null,
  });

  const startMutation = useMutation({
    mutationFn: () => placementTestApi.start(language),
    onSuccess: (data) => {
      setState((s) => ({
        ...s,
        phase: 'question',
        attemptId: data.attemptId,
        totalQuestions: data.totalQuestions,
        questionsAnswered: 0,
        currentQuestion: data.question,
        error: null,
      }));
    },
    onError: (err: Error) => {
      setState((s) => ({ ...s, error: err.message }));
    },
  });

  const answerMutation = useMutation({
    mutationFn: ({
      attemptId,
      questionId,
      selectedOptionIndex,
    }: {
      attemptId: string;
      questionId: string;
      selectedOptionIndex: number;
    }) => placementTestApi.answer(attemptId, questionId, selectedOptionIndex),
    onSuccess: (data) => {
      if (data.kind === 'next') {
        setState((s) => ({
          ...s,
          questionsAnswered: data.questionsAnswered,
          totalQuestions: data.totalQuestions,
          currentQuestion: data.question,
          error: null,
        }));
      } else {
        setState((s) => ({
          ...s,
          phase: 'result',
          questionsAnswered: data.questionsAnswered,
          currentQuestion: null,
          recommendedLevel: data.recommendedLevel,
          selectedLevel: data.recommendedLevel,
          attemptId: data.attemptId,
          error: null,
        }));
      }
    },
    onError: (err: Error) => {
      setState((s) => ({ ...s, error: err.message }));
    },
  });

  const skipMutation = useMutation({
    mutationFn: (selectedLevel?: string) =>
      placementTestApi.skip(language, selectedLevel),
    onSuccess: (data) => {
      setState((s) => ({
        ...s,
        phase: 'result',
        attemptId: data.attemptId,
        recommendedLevel: data.selectedLevel ?? 'A1',
        selectedLevel: data.selectedLevel ?? 'A1',
        currentQuestion: null,
        error: null,
      }));
    },
    onError: (err: Error) => {
      setState((s) => ({ ...s, error: err.message }));
    },
  });

  const overrideMutation = useMutation({
    mutationFn: ({
      attemptId,
      selectedLevel,
    }: {
      attemptId: string;
      selectedLevel: string;
    }) => placementTestApi.overrideLevel(attemptId, selectedLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-languages'] });
    },
    onError: (err: Error) => {
      setState((s) => ({ ...s, error: err.message }));
    },
  });

  const confirmAndAddLanguageMutation = useMutation({
    mutationFn: (body: {
      language: string;
      placementAttemptId?: string;
      selectedLevel?: string;
    }) => userLanguagesApi.add(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-languages'] });
    },
  });

  const startTest = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
    startMutation.mutate();
  }, [startMutation]);

  const submitAnswer = useCallback(
    (selectedOptionIndex: number) => {
      const { attemptId, currentQuestion } = state;
      if (!attemptId || !currentQuestion) return;
      setState((s) => ({ ...s, error: null }));
      answerMutation.mutate({
        attemptId,
        questionId: currentQuestion.id,
        selectedOptionIndex,
      });
    },
    [state, answerMutation],
  );

  const skipTest = useCallback(
    (selectedLevel?: string) => {
      setState((s) => ({ ...s, error: null }));
      skipMutation.mutate(selectedLevel);
    },
    [skipMutation],
  );

  const confirmLevel = useCallback(
    (selectedLevel: string) => {
      const { attemptId } = state;
      setState((s) => ({ ...s, selectedLevel, error: null }));
      if (attemptId) {
        overrideMutation.mutate({ attemptId, selectedLevel });
      }
    },
    [state, overrideMutation],
  );

  const startWithLevel = useCallback(
    (selectedLevel: string, attemptId?: string | null) => {
      setState((s) => ({ ...s, selectedLevel }));
      confirmAndAddLanguageMutation.mutate({
        language,
        ...(attemptId && { placementAttemptId: attemptId }),
        selectedLevel,
      });
    },
    [language, confirmAndAddLanguageMutation],
  );

  const goToLevelSelect = useCallback(() => {
    setState((s) => ({ ...s, phase: 'level-select' }));
  }, []);

  return {
    state,
    CEFR_LEVELS,
    startTest,
    submitAnswer,
    skipTest,
    confirmLevel,
    startWithLevel,
    goToLevelSelect,
    isStarting: startMutation.isPending,
    isAnswering: answerMutation.isPending,
    isSkipping: skipMutation.isPending,
    isConfirming:
      overrideMutation.isPending || confirmAndAddLanguageMutation.isPending,
  };
}
