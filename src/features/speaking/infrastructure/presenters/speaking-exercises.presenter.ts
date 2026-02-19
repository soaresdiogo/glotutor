import { NextResponse } from 'next/server';

import type { SpeakingExerciseEntity } from '@/features/speaking/domain/entities/speaking-exercise.entity';

export const SpeakingExercisesPresenter = {
  success(exercises: SpeakingExerciseEntity[]) {
    return NextResponse.json({
      exercises: exercises.map((e) => ({
        id: e.id,
        topicId: e.topicId,
        questionNumber: e.questionNumber,
        type: e.type,
        questionText: e.questionText,
        options: e.options,
        correctAnswer: e.correctAnswer,
        explanationText: e.explanationText,
      })),
    });
  },
};
