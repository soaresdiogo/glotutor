'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { PlacementQuestion } from '@/client-api/placement-test.api';
import { httpClient } from '@/shared/lib/http-client';

type ExamPhase = 'intro' | 'question' | 'result-pass' | 'result-fail';

type ExamState = {
  phase: ExamPhase;
  examId: string | null;
  language: string;
  cefrLevel: string;
  totalQuestions: number;
  questionsAnswered: number;
  currentQuestion: PlacementQuestion | null;
  result: {
    passed: boolean;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    nextLevelUnlocked: string | null;
  } | null;
  error: string | null;
};

export function useCertificationExam(language: string) {
  const [state, setState] = useState<ExamState>({
    phase: 'intro',
    examId: null,
    language,
    cefrLevel: '',
    totalQuestions: 0,
    questionsAnswered: 0,
    currentQuestion: null,
    result: null,
    error: null,
  });

  const startMutation = useMutation({
    mutationFn: () =>
      httpClient.post('certification/start', { json: { language } }).json<{
        examId: string;
        language: string;
        cefrLevel: string;
        totalQuestions: number;
        question: PlacementQuestion;
      }>(),
    onSuccess: (data) => {
      setState((s) => ({
        ...s,
        phase: 'question',
        examId: data.examId,
        cefrLevel: data.cefrLevel,
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
      examId,
      questionId,
      selectedOptionIndex,
    }: {
      examId: string;
      questionId: string;
      selectedOptionIndex: number;
    }) =>
      httpClient
        .post('certification/answer', {
          json: { examId, questionId, selectedOptionIndex },
        })
        .json<
          | {
              kind: 'next';
              question: PlacementQuestion;
              questionsAnswered: number;
            }
          | {
              kind: 'result';
              passed: boolean;
              score: number;
              totalQuestions: number;
              correctAnswers: number;
              nextLevelUnlocked: string | null;
            }
        >(),
    onSuccess: (data) => {
      if (data.kind === 'next') {
        setState((s) => ({
          ...s,
          questionsAnswered: data.questionsAnswered,
          currentQuestion: data.question,
          error: null,
        }));
      } else {
        setState((s) => ({
          ...s,
          phase: data.passed ? 'result-pass' : 'result-fail',
          currentQuestion: null,
          result: {
            passed: data.passed,
            score: data.score,
            totalQuestions: data.totalQuestions,
            correctAnswers: data.correctAnswers,
            nextLevelUnlocked: data.nextLevelUnlocked,
          },
          error: null,
        }));
      }
    },
    onError: (err: Error) => {
      setState((s) => ({ ...s, error: err.message }));
    },
  });

  const startExam = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
    startMutation.mutate();
  }, [startMutation]);

  const submitAnswer = useCallback(
    (selectedOptionIndex: number) => {
      const { examId, currentQuestion } = state;
      if (!examId || !currentQuestion) return;
      setState((s) => ({ ...s, error: null }));
      answerMutation.mutate({
        examId,
        questionId: currentQuestion.id,
        selectedOptionIndex,
      });
    },
    [state, answerMutation],
  );

  return {
    state,
    startExam,
    submitAnswer,
    isStarting: startMutation.isPending,
    isAnswering: answerMutation.isPending,
  };
}
