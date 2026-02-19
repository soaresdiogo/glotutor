import type { GrammarItemEntity } from '../entities/reading-session.entity';

export type GrammarAnalysisInput = {
  /** Optional; when provided with same level+language, enables cache hit. */
  textId?: string;
  textContent: string;
  studentLevel: string;
  nativeLanguage: string;
};

export interface IGrammarAnalysisService {
  analyze(input: GrammarAnalysisInput): Promise<GrammarItemEntity[]>;
}
