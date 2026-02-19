import { NextResponse } from 'next/server';

import type { StudentPodcastProgressEntity } from '@/features/listening/domain/entities/student-podcast-progress.entity';

export const ProgressPresenter = {
  success(progress: StudentPodcastProgressEntity) {
    return NextResponse.json(progress);
  },
};
