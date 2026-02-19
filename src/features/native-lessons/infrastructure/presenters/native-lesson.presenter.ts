import { NextResponse } from 'next/server';

import type { DailyLimitDTO } from '@/features/native-lessons/application/dto/daily-limit.dto';
import type { LessonDetailDTO } from '@/features/native-lessons/application/dto/lesson-detail.dto';
import type { LessonListItemDTO } from '@/features/native-lessons/application/dto/lesson-list-item.dto';

export const NativeLessonPresenter = {
  lessonList(lessons: LessonListItemDTO[]) {
    return NextResponse.json({ lessons });
  },

  lessonDetail(lesson: LessonDetailDTO) {
    return NextResponse.json(lesson);
  },

  dailyLimit(data: DailyLimitDTO) {
    return NextResponse.json(data);
  },

  startSuccess(progress: { status: string; startedAt: Date | null }) {
    return NextResponse.json(progress);
  },

  completeSuccess(progress: {
    status: string;
    score: number;
    completedAt: Date | null;
  }) {
    return NextResponse.json(progress);
  },

  saveProgressSuccess(progress: { status: string }) {
    return NextResponse.json(progress);
  },

  redoSuccess(progress: { status: string }) {
    return NextResponse.json(progress);
  },
};
