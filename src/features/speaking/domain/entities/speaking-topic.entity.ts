export type SpeakingTopicEntity = {
  id: string;
  languageId: string;
  slug: string;
  title: string;
  description: string;
  cefrLevel: string;
  contextPrompt: string;
  keyVocabulary: string[];
  nativeExpressions: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SpeakingTopicListItemEntity = Pick<
  SpeakingTopicEntity,
  'id' | 'slug' | 'title' | 'description' | 'cefrLevel' | 'createdAt'
> & {
  languageCode: string;
};

export type SpeakingTopicDetailEntity = SpeakingTopicEntity & {
  languageCode: string;
};
