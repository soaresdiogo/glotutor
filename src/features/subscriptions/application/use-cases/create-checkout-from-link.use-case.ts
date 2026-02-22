import type { IPendingSignupRepository } from '@/features/subscriptions/domain/repositories/pending-signup-repository.interface';
import { verifyPaymentLinkToken } from '@/shared/lib/auth/jwt';
import { BadRequestError } from '@/shared/lib/errors';
import type { CreateCheckoutResponseDto } from '../../infrastructure/presenters/create-checkout.presenter';
import type { ICreateCheckoutSessionUseCase } from './create-checkout-session.use-case';

export interface ICreateCheckoutFromLinkUseCase {
  execute(
    token: string,
    context: { tenantId: string; successUrl: string; cancelUrl: string },
  ): Promise<CreateCheckoutResponseDto>;
}

export class CreateCheckoutFromLinkUseCase
  implements ICreateCheckoutFromLinkUseCase
{
  constructor(
    private readonly createCheckoutSessionUseCase: ICreateCheckoutSessionUseCase,
    private readonly pendingSignupRepo: IPendingSignupRepository,
  ) {}

  async execute(
    token: string,
    context: { tenantId: string; successUrl: string; cancelUrl: string },
  ): Promise<CreateCheckoutResponseDto> {
    const { payload } = await verifyPaymentLinkToken(token);
    const pending = await this.pendingSignupRepo.findValidByEmail(
      payload.email,
    );
    if (!pending) {
      throw new BadRequestError(
        'This payment link has expired or is invalid. Please sign up again.',
        'subscriptions.invalidPaymentLink',
      );
    }
    return this.createCheckoutSessionUseCase.execute(
      {
        email: payload.email,
        fullName: payload.fullName,
        planType: payload.planType,
      },
      context,
    );
  }
}
