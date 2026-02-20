import type { IStripeService } from '@/infrastructure/services/stripe/stripe.service';
import { CheckoutSessionPresenter } from '../../infrastructure/presenters/checkout-session.presenter';
import type { CheckoutSessionDto } from '../dto/checkout-session.dto';

export interface IGetCheckoutSessionUseCase {
  execute(sessionId: string): Promise<CheckoutSessionDto>;
}

export class GetCheckoutSessionUseCase implements IGetCheckoutSessionUseCase {
  constructor(private readonly stripeService: IStripeService) {}

  async execute(sessionId: string): Promise<CheckoutSessionDto> {
    const session = await this.stripeService.getCheckoutSession(sessionId, [
      'subscription',
      'customer',
    ]);
    return CheckoutSessionPresenter.toDto(session);
  }
}
