import type { LevelProgressEntity } from '../entities/level-progress.entity';

export interface ILevelProgressProvider {
  getLevelProgress(
    userId: string,
    language: string,
    cefrLevel: string,
  ): Promise<LevelProgressEntity>;
}
