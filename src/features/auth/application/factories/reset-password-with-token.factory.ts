import type { IResetPasswordWithTokenUseCase } from '@/features/auth/application/use-cases/reset-password-with-token.use-case';
import { ResetPasswordWithTokenUseCase } from '@/features/auth/application/use-cases/reset-password-with-token.use-case';
import { passwordResetRepository } from '@/features/auth/infrastructure/drizzle-repositories/password-reset.repository';

export function makeResetPasswordWithTokenUseCase(): IResetPasswordWithTokenUseCase {
  return new ResetPasswordWithTokenUseCase(passwordResetRepository);
}
