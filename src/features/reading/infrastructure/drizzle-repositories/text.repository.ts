import { eq } from 'drizzle-orm';

import type {
  ITextRepository,
  ReadingTextDetailEntity,
  TextContentEntity,
} from '@/features/reading/domain/repositories/text-repository.interface';
import {
  extractComprehensionFromContent,
  extractReadableTextFromContent,
} from '@/features/reading/infrastructure/utils/extract-readable-text';

import { texts } from '@/infrastructure/db/schema/texts';
import type { DbClient } from '@/infrastructure/db/types';

export class TextRepository implements ITextRepository {
  constructor(private readonly dbClient: DbClient) {}

  async findContentById(textId: string): Promise<TextContentEntity | null> {
    const row = await this.dbClient.query.texts.findFirst({
      where: eq(texts.id, textId),
      columns: { id: true, content: true, languageId: true },
      with: { language: { columns: { code: true } } },
    });
    if (!row) return null;
    return {
      id: row.id,
      content: extractReadableTextFromContent(row.content),
      languageCode: row.language?.code ?? 'en',
    };
  }

  async findPublishedDetailById(
    textId: string,
  ): Promise<ReadingTextDetailEntity | null> {
    const row = await this.dbClient.query.texts.findFirst({
      where: eq(texts.id, textId),
      columns: {
        id: true,
        title: true,
        content: true,
        category: true,
        level: true,
        cefrLevel: true,
        wordCount: true,
        estimatedMinutes: true,
        languageId: true,
        isPublished: true,
      },
      with: {
        language: { columns: { code: true } },
        vocabulary: {
          columns: {
            word: true,
            phoneticIpa: true,
            definition: true,
            exampleSentence: true,
            partOfSpeech: true,
          },
        },
      },
    });
    if (!row?.isPublished) return null;
    const comprehension = extractComprehensionFromContent(row.content);
    return {
      id: row.id,
      title: row.title,
      content: extractReadableTextFromContent(row.content),
      category: row.category,
      level: row.level,
      cefrLevel: row.cefrLevel,
      wordCount: row.wordCount,
      estimatedMinutes: row.estimatedMinutes,
      languageCode: row.language?.code ?? 'en',
      vocabulary: (row.vocabulary ?? []).map((v) => ({
        word: v.word,
        phoneticIpa: v.phoneticIpa,
        definition: v.definition,
        exampleSentence: v.exampleSentence,
        partOfSpeech: v.partOfSpeech,
      })),
      comprehension,
    };
  }
}
