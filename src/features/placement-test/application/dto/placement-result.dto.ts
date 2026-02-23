import type { PlacementQuestionDto } from './placement-question.dto';

export type PlacementStartResponseDto = {
  attemptId: string;
  language: string;
  totalQuestions: number;
  question: PlacementQuestionDto;
};

export type PlacementAnswerResponseDto =
  | {
      kind: 'next';
      question: PlacementQuestionDto;
      questionsAnswered: number;
      totalQuestions: number;
    }
  | {
      kind: 'result';
      recommendedLevel: string;
      questionsAnswered: number;
      attemptId: string;
    };

export type PlacementCompleteResponseDto = {
  attemptId: string;
  recommendedLevel: string;
  selectedLevel: string;
};

export type PlacementSkipResponseDto = {
  attemptId: string;
  language: string;
  selectedLevel: string | null;
};

export type PlacementOverrideResponseDto = {
  attemptId: string;
  selectedLevel: string;
};
