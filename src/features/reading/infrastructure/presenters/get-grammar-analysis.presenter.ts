import { NextResponse } from 'next/server';

import type { GetGrammarAnalysisResult } from '@/features/reading/application/use-cases/get-grammar-analysis.use-case';

export const GetGrammarAnalysisPresenter = {
  success(result: GetGrammarAnalysisResult) {
    return NextResponse.json(result);
  },
};
