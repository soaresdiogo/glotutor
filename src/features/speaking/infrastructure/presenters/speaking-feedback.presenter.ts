import { NextResponse } from 'next/server';

import type { SpeakingFeedbackEntity } from '@/features/speaking/domain/entities/speaking-session.entity';

export const SpeakingFeedbackPresenter = {
  success(feedback: SpeakingFeedbackEntity) {
    return NextResponse.json(feedback);
  },
};
