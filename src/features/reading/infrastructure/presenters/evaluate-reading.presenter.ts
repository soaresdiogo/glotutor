import { NextResponse } from 'next/server';

import type { EvaluateReadingResult } from '@/features/reading/application/use-cases/evaluate-reading.use-case';

export const EvaluateReadingPresenter = {
  success(result: EvaluateReadingResult) {
    return NextResponse.json(result);
  },
};
