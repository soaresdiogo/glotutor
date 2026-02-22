import { httpClient } from '@/shared/lib/http-client';

export type MySubscriptionResponse = {
  status: string;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  accessUntil: string | null;
};

export const subscriptionsApi = {
  getMySubscription: () =>
    httpClient.get('subscriptions/me').json<MySubscriptionResponse | null>(),

  cancelSubscription: () =>
    httpClient
      .post('subscriptions/cancel')
      .json<{ cancelAtPeriodEnd: boolean }>(),
};
