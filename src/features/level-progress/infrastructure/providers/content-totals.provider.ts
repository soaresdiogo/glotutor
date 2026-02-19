import { and, eq, sql } from 'drizzle-orm';
import type { IContentTotalsProvider } from '@/features/level-progress/domain/ports/content-totals-provider.interface';
import { nativeLessons } from '@/infrastructure/db/schema/native-lessons';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { speakingTopics } from '@/infrastructure/db/schema/speaking-topics';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import { texts } from '@/infrastructure/db/schema/texts';
import type { DbClient } from '@/infrastructure/db/types';

export class ContentTotalsProvider implements IContentTotalsProvider {
  constructor(private readonly db: DbClient) {}

  async getTotals(
    language: string,
    cefrLevel: string,
  ): Promise<{
    lessonsTotal: number;
    podcastsTotal: number;
    readingsTotal: number;
    conversationsTotal: number;
  }> {
    const langRow = await this.db.query.supportedLanguages.findFirst({
      where: eq(supportedLanguages.code, language),
      columns: { id: true },
    });
    const languageId = langRow?.id ?? null;

    const [lessonsTotal, podcastsTotal, readingsTotal, conversationsTotal] =
      await Promise.all([
        this.db
          .select({ count: sql<number>`count(*)::int` })
          .from(nativeLessons)
          .where(
            and(
              eq(nativeLessons.language, language),
              eq(nativeLessons.level, cefrLevel),
              eq(nativeLessons.isPublished, true),
            ),
          )
          .then((r) => r[0]?.count ?? 0),

        languageId
          ? this.db
              .select({ count: sql<number>`count(*)::int` })
              .from(podcasts)
              .where(
                and(
                  eq(podcasts.languageId, languageId),
                  eq(podcasts.cefrLevel, cefrLevel),
                ),
              )
              .then((r) => r[0]?.count ?? 0)
          : 0,

        languageId
          ? this.db
              .select({ count: sql<number>`count(*)::int` })
              .from(texts)
              .where(
                and(
                  eq(texts.languageId, languageId),
                  eq(texts.level, cefrLevel),
                  eq(texts.isPublished, true),
                ),
              )
              .then((r) => r[0]?.count ?? 0)
          : 0,

        languageId
          ? this.db
              .select({ count: sql<number>`count(*)::int` })
              .from(speakingTopics)
              .where(
                and(
                  eq(speakingTopics.languageId, languageId),
                  eq(speakingTopics.cefrLevel, cefrLevel),
                ),
              )
              .then((r) => r[0]?.count ?? 0)
          : 0,
      ]);

    return {
      lessonsTotal,
      podcastsTotal,
      readingsTotal,
      conversationsTotal,
    };
  }
}
