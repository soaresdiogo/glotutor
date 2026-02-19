import type { PlacementAttemptEntity } from '../entities/placement-attempt.entity';

export interface IPlacementAttemptRepository {
  create(data: {
    userId: string;
    language: string;
    totalQuestions: number;
  }): Promise<PlacementAttemptEntity>;

  findById(id: string): Promise<PlacementAttemptEntity | null>;

  findInProgressByUserAndLanguage(
    userId: string,
    language: string,
  ): Promise<PlacementAttemptEntity | null>;

  update(
    id: string,
    data: {
      status?: PlacementAttemptEntity['status'];
      recommendedLevel?: string | null;
      selectedLevel?: string | null;
      totalQuestions?: number;
      completedAt?: Date | null;
    },
  ): Promise<PlacementAttemptEntity>;
}
