import type { LevelProgressEntity } from '@/features/level-progress/domain/entities/level-progress.entity';
import type { IContentTotalsProvider } from '@/features/level-progress/domain/ports/content-totals-provider.interface';
import type { ILevelProgressProvider } from '@/features/level-progress/domain/ports/level-progress-provider.interface';
import type { ILevelProgressRepository } from '@/features/level-progress/domain/repositories/level-progress.repository.interface';
import type { DbClient } from '@/infrastructure/db/types';

/**
 * Reads level progress from the level_progress table only (no heavy joins).
 * If no row exists, creates one with content totals and zero completed (backwards compatibility).
 */
export class LevelProgressProvider implements ILevelProgressProvider {
  constructor(
    readonly _db: DbClient,
    private readonly levelProgressRepo: ILevelProgressRepository,
    private readonly contentTotals: IContentTotalsProvider,
  ) {}

  async getLevelProgress(
    userId: string,
    language: string,
    cefrLevel: string,
  ): Promise<LevelProgressEntity> {
    let row = await this.levelProgressRepo.findByUserLanguageLevel(
      userId,
      language,
      cefrLevel,
    );

    if (!row) {
      const totals = await this.contentTotals.getTotals(language, cefrLevel);
      const created = await this.levelProgressRepo.create({
        userId,
        language,
        cefrLevel,
        lessonsTotal: totals.lessonsTotal,
        podcastsTotal: totals.podcastsTotal,
        readingsTotal: totals.readingsTotal,
        conversationsTotal: totals.conversationsTotal,
      });
      row = created;
    }

    const completionPercentage =
      row.completionPercentage != null ? Number(row.completionPercentage) : 0;

    return {
      language: row.language,
      cefrLevel: row.cefrLevel,
      lessonsTotal: row.lessonsTotal,
      lessonsCompleted: row.lessonsCompleted,
      podcastsTotal: row.podcastsTotal,
      podcastsCompleted: row.podcastsCompleted,
      readingsTotal: row.readingsTotal,
      readingsCompleted: row.readingsCompleted,
      conversationsTotal: row.conversationsTotal,
      conversationsCompleted: row.conversationsCompleted,
      completionPercentage,
      certificationUnlocked: row.certificationUnlocked,
      certifiedAt: row.certifiedAt,
    };
  }
}
