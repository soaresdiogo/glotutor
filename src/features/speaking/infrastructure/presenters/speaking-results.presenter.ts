import { NextResponse } from 'next/server';

import type { SessionResultsEntity } from '@/features/speaking/application/use-cases/get-session-results.use-case';

export const SpeakingResultsPresenter = {
  success(results: SessionResultsEntity) {
    return NextResponse.json({
      sessionId: results.sessionId,
      topicTitle: results.topicTitle,
      topicSlug: results.topicSlug,
      cefrLevel: results.cefrLevel,
      feedback: results.feedback,
      exercises: results.exercises.map((e) => ({
        ...e,
        attempt: e.attempt
          ? {
              id: e.attempt.id,
              answer: e.attempt.answer,
              isCorrect: e.attempt.isCorrect,
              createdAt: e.attempt.createdAt.toISOString(),
            }
          : null,
      })),
      exerciseScore: results.exerciseScore,
    });
  },
};
