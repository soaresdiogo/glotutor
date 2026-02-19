import { NextResponse } from 'next/server';

import type { SpeakingSessionEntity } from '@/features/speaking/domain/entities/speaking-session.entity';

export const SpeakingSessionPresenter = {
  success(
    session: SpeakingSessionEntity,
    meta?: { remainingSessions: number; dailyLimit: number },
  ) {
    return NextResponse.json({
      id: session.id,
      topicId: session.topicId,
      status: session.status,
      durationSeconds: session.durationSeconds,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      ...(meta != null && {
        remainingSessions: meta.remainingSessions,
        dailyLimit: meta.dailyLimit,
      }),
    });
  },
};
