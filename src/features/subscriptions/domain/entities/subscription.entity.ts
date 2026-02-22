export type SubscriptionEntity = {
  id: string;
  userId: string;
  tenantId: string | null;
  priceId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
