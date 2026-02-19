import { NextResponse } from 'next/server';

import type { SpeakingTopicListItemEntity } from '@/features/speaking/domain/entities/speaking-topic.entity';

export const SpeakingTopicsPresenter = {
  success(topics: SpeakingTopicListItemEntity[]) {
    return NextResponse.json({ topics });
  },
};
