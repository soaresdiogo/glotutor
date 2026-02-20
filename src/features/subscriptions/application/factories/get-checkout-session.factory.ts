import type { IGetCheckoutSessionUseCase } from '@/features/subscriptions/application/use-cases/get-checkout-session.use-case';
import { GetCheckoutSessionUseCase } from '@/features/subscriptions/application/use-cases/get-checkout-session.use-case';
import { stripeService } from '@/infrastructure/services/stripe/stripe.service';

export function makeGetCheckoutSessionUseCase(): IGetCheckoutSessionUseCase {
  return new GetCheckoutSessionUseCase(stripeService);
}
