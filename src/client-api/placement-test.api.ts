import { httpClient } from '@/shared/lib/http-client';

export type PlacementQuestion = {
  id: string;
  language: string;
  cefrLevel: string;
  questionType: string;
  questionText: string;
  audioUrl: string | null;
  options: string[];
};

export type PlacementStartResponse = {
  attemptId: string;
  language: string;
  totalQuestions: number;
  question: PlacementQuestion;
};

export type PlacementAnswerResponseNext = {
  kind: 'next';
  question: PlacementQuestion;
  questionsAnswered: number;
  totalQuestions: number;
};

export type PlacementAnswerResponseResult = {
  kind: 'result';
  recommendedLevel: string;
  questionsAnswered: number;
  attemptId: string;
};

export type PlacementAnswerResponse =
  | PlacementAnswerResponseNext
  | PlacementAnswerResponseResult;

export type PlacementCompleteResponse = {
  attemptId: string;
  recommendedLevel: string;
  selectedLevel: string;
};

export type PlacementSkipResponse = {
  attemptId: string;
  language: string;
  selectedLevel: string | null;
};

export type PlacementOverrideResponse = {
  attemptId: string;
  selectedLevel: string;
};

export const placementTestApi = {
  start: (language: string) =>
    httpClient
      .post('placement-test/start', { json: { language } })
      .json<PlacementStartResponse>(),

  answer: (
    attemptId: string,
    questionId: string,
    selectedOptionIndex: number,
  ) =>
    httpClient
      .post('placement-test/answer', {
        json: {
          attemptId,
          questionId,
          selectedOptionIndex,
        },
      })
      .json<PlacementAnswerResponse>(),

  complete: (attemptId: string) =>
    httpClient
      .post('placement-test/complete', { json: { attemptId } })
      .json<PlacementCompleteResponse>(),

  skip: (language: string, selectedLevel?: string) =>
    httpClient
      .post('placement-test/skip', {
        json: { language, selectedLevel },
      })
      .json<PlacementSkipResponse>(),

  overrideLevel: (attemptId: string, selectedLevel: string) =>
    httpClient
      .post('placement-test/override-level', {
        json: { attemptId, selectedLevel },
      })
      .json<PlacementOverrideResponse>(),
};
