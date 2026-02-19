import type { PlacementQuestionEntity } from '../entities/placement-question.entity';

export type PlacementQuestionType = PlacementQuestionEntity['questionType'];

export type QuestionPool = 'placement' | 'certification';

export interface IPlacementQuestionRepository {
  findById(id: string): Promise<PlacementQuestionEntity | null>;

  findRandomByLanguageAndLevel(
    language: string,
    cefrLevel: string,
    limit: number,
    excludeIds?: string[],
  ): Promise<PlacementQuestionEntity[]>;

  /** Questions for certification exams only (pool = 'certification'). */
  findRandomCertificationByLanguageAndLevel(
    language: string,
    cefrLevel: string,
    limit: number,
    excludeIds?: string[],
  ): Promise<PlacementQuestionEntity[]>;
}
