import type { PlacementAnswerEntity } from '../entities/placement-answer.entity';

export interface IPlacementAnswerRepository {
  create(data: {
    attemptId: string;
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    cefrLevel: string;
  }): Promise<PlacementAnswerEntity>;

  findByAttemptId(attemptId: string): Promise<PlacementAnswerEntity[]>;
}
