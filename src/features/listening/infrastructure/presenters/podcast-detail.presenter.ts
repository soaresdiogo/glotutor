import { NextResponse } from 'next/server';

import type { PodcastDetailEntity } from '@/features/listening/domain/repositories/podcast-repository.interface';

export const PodcastDetailPresenter = {
  success(detail: PodcastDetailEntity) {
    return NextResponse.json(detail);
  },
};
