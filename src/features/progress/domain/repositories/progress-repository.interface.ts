import type { ProgressResultEntity } from '../entities/progress-result.entity';

export interface IProgressRepository {
  getProgressByUserId(
    userId: string,
    language?: string,
  ): Promise<ProgressResultEntity>;
}
