import type {
  SpeakingTopicDetailEntity,
  SpeakingTopicListItemEntity,
} from '../entities/speaking-topic.entity';

export interface ISpeakingTopicRepository {
  /** Returns topics for the given language and any of the given CEFR levels (e.g. ['A1', 'A2'] for level and below). Levels are compared case-insensitively. */
  findManyByLanguageAndLevel(
    languageCode: string,
    cefrLevels: string[],
  ): Promise<SpeakingTopicListItemEntity[]>;

  findBySlug(
    slug: string,
    languageCode: string,
  ): Promise<SpeakingTopicDetailEntity | null>;

  findById(topicId: string): Promise<SpeakingTopicDetailEntity | null>;
}
