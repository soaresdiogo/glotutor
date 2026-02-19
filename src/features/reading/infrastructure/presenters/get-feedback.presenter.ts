import { NextResponse } from 'next/server';

import type { FeedbackResult } from '@/features/reading/domain/ports/feedback-ai-service.interface';

export const GetFeedbackPresenter = {
  success(data: FeedbackResult) {
    return NextResponse.json(data);
  },
};
