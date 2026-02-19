import { NextResponse } from 'next/server';

import type { SpeakingTopicDetailEntity } from '@/features/speaking/domain/entities/speaking-topic.entity';

export const SpeakingTopicDetailPresenter = {
  success(topic: SpeakingTopicDetailEntity) {
    return NextResponse.json({
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      cefrLevel: topic.cefrLevel,
      languageCode: topic.languageCode,
      contextPrompt: topic.contextPrompt,
      keyVocabulary: topic.keyVocabulary,
      nativeExpressions: topic.nativeExpressions,
      sortOrder: topic.sortOrder,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    });
  },
};
