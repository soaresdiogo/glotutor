export type PlacementAnswerEntity = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  cefrLevel: string;
  answeredAt: Date;
};
