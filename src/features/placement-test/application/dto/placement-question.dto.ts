export type PlacementQuestionDto = {
  id: string;
  language: string;
  cefrLevel: string;
  questionType: string;
  questionText: string;
  audioUrl: string | null;
  options: string[];
  /** Not sent to client - server only */
  correctOptionIndex?: number;
};
