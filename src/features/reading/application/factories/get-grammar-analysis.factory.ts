import type { IGetGrammarAnalysisUseCase } from '@/features/reading/application/use-cases/get-grammar-analysis.use-case';
import { GetGrammarAnalysisUseCase } from '@/features/reading/application/use-cases/get-grammar-analysis.use-case';
import { StudentProfileRepository } from '@/features/reading/infrastructure/drizzle-repositories/student-profile.repository';
import { TextRepository } from '@/features/reading/infrastructure/drizzle-repositories/text.repository';
import { OpenAIGrammarService } from '@/features/reading/infrastructure/services/openai-grammar.service';

import { db } from '@/infrastructure/db/client';

export function makeGetGrammarAnalysisUseCase(): IGetGrammarAnalysisUseCase {
  const openaiKey = process.env.OPENAI_API_KEY ?? '';
  return new GetGrammarAnalysisUseCase(
    new OpenAIGrammarService(openaiKey),
    new TextRepository(db),
    new StudentProfileRepository(db),
  );
}
