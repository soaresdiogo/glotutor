import { NextResponse } from 'next/server';

import type { PodcastListItemEntity } from '@/features/listening/domain/repositories/podcast-repository.interface';

export const PodcastListPresenter = {
  success(podcasts: PodcastListItemEntity[]) {
    return NextResponse.json({ podcasts });
  },
};
