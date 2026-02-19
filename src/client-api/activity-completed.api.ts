import { httpClient } from '@/shared/lib/http-client';

export type ActivityType = 'lesson' | 'podcast' | 'reading' | 'conversation';

export type CompleteActivityBody = {
  language: string;
  cefrLevel: string;
  activityType: ActivityType;
  activityId?: string;
  durationMinutes: number;
};

export const activityCompletedApi = {
  complete: (body: CompleteActivityBody) =>
    httpClient.post('activity-completed', { json: body }).json<{ ok: true }>(),
};
