export type PlacementQuestionType =
  | 'reading_comprehension'
  | 'vocabulary'
  | 'listening';

export type PlacementQuestionEntity = {
  id: string;
  language: string;
  cefrLevel: string;
  questionType: PlacementQuestionType;
  questionText: string;
  audioUrl: string | null;
  options: string[];
  correctOptionIndex: number;
  createdAt: Date;
  updatedAt: Date;
};
