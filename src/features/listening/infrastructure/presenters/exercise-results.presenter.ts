import { NextResponse } from 'next/server';

import type { ExerciseResultsOutput } from '@/features/listening/application/use-cases/get-exercise-results.use-case';
import type { SubmitExercisesOutput } from '@/features/listening/application/use-cases/submit-exercises.use-case';

export const ExerciseResultsPresenter = {
  submitSuccess(data: SubmitExercisesOutput) {
    return NextResponse.json(data);
  },

  resultsSuccess(data: ExerciseResultsOutput) {
    return NextResponse.json(data);
  },
};
