import { NextResponse } from 'next/server';

export const SpeakingAttemptPresenter = {
  success(data: { correct: boolean; attemptId: string; hint?: string }) {
    return NextResponse.json({
      correct: data.correct,
      attemptId: data.attemptId,
      ...(data.hint != null && { hint: data.hint }),
    });
  },
};
