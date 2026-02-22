import { and, eq, inArray, sql } from 'drizzle-orm';
import type {
  SpeakingTopicDetailEntity,
  SpeakingTopicListItemEntity,
} from '@/features/speaking/domain/entities/speaking-topic.entity';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import { speakingTopics } from '@/infrastructure/db/schema/speaking-topics';
import type { DbClient } from '@/infrastructure/db/types';

/** Normalize CEFR level for comparison (case-insensitive). */
function normalizeCefr(level: string): string {
  return level.trim().toUpperCase();
}

export class SpeakingTopicRepository implements ISpeakingTopicRepository {
  constructor(private readonly dbClient: DbClient) {}

  async findManyByLanguageAndLevel(
    languageCode: string,
    cefrLevels: string[],
  ): Promise<SpeakingTopicListItemEntity[]> {
    const codePrefix = languageCode.split('-')[0];
    const languages = await this.dbClient.query.supportedLanguages.findMany({
      where: (t, { like }) => like(t.code, `${codePrefix}%`),
      columns: { id: true },
    });
    const languageIds = languages.map((l) => l.id);
    if (languageIds.length === 0) return [];

    const normalizedLevels = cefrLevels.map(normalizeCefr).filter(Boolean);
    if (normalizedLevels.length === 0) return [];

    const rows = await this.dbClient.query.speakingTopics.findMany({
      where: and(
        inArray(speakingTopics.languageId, languageIds),
        sql`upper(trim(${speakingTopics.cefrLevel})) in (${sql.join(
          normalizedLevels.map((l) => sql`${l}`),
          sql`, `,
        )})`,
      ),
      columns: {
        id: true,
        slug: true,
        title: true,
        description: true,
        cefrLevel: true,
        createdAt: true,
        languageId: true,
      },
      with: { language: { columns: { code: true } } },
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.createdAt)],
    });

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      cefrLevel: r.cefrLevel,
      languageCode: r.language?.code ?? languageCode,
      createdAt: r.createdAt,
    }));
  }

  async findBySlug(
    slug: string,
    languageCode: string,
  ): Promise<SpeakingTopicDetailEntity | null> {
    const codePrefix = languageCode.split('-')[0];
    const languages = await this.dbClient.query.supportedLanguages.findMany({
      where: (t, { like }) => like(t.code, `${codePrefix}%`),
      columns: { id: true },
    });
    const languageIds = languages.map((l) => l.id);
    if (languageIds.length === 0) return null;

    const row = await this.dbClient.query.speakingTopics.findFirst({
      where: and(
        eq(speakingTopics.slug, slug),
        inArray(speakingTopics.languageId, languageIds),
      ),
      with: { language: { columns: { code: true } } },
    });
    if (!row) return null;

    return {
      id: row.id,
      languageId: row.languageId,
      slug: row.slug,
      title: row.title,
      description: row.description,
      cefrLevel: row.cefrLevel,
      contextPrompt: row.contextPrompt,
      keyVocabulary: row.keyVocabulary ?? [],
      nativeExpressions: row.nativeExpressions ?? [],
      sortOrder: row.sortOrder,
      languageCode: row.language?.code ?? languageCode,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findById(topicId: string): Promise<SpeakingTopicDetailEntity | null> {
    const row = await this.dbClient.query.speakingTopics.findFirst({
      where: eq(speakingTopics.id, topicId),
      with: { language: { columns: { code: true } } },
    });
    if (!row) return null;

    return {
      id: row.id,
      languageId: row.languageId,
      slug: row.slug,
      title: row.title,
      description: row.description,
      cefrLevel: row.cefrLevel,
      contextPrompt: row.contextPrompt,
      keyVocabulary: row.keyVocabulary ?? [],
      nativeExpressions: row.nativeExpressions ?? [],
      sortOrder: row.sortOrder,
      languageCode: row.language?.code ?? 'en',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
