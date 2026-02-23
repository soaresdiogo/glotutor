import type { IMfaSessionRepository } from '@/features/auth/domain/repositories/mfa-session-repository.interface';
import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import type { EmailService } from '@/infrastructure/services/email/email.service';
import { comparePassword } from '@/shared/lib/auth/password';
import { hashToken } from '@/shared/lib/auth/token-hash';
import { ForbiddenError, UnauthorizedError } from '@/shared/lib/errors';
import type { LoginDto } from '../dto/login.dto';

export interface IInitiateMfaUseCase {
  execute(credentials: LoginDto): Promise<{ sessionId: string }>;
}

export class InitiateMfaUseCase implements IInitiateMfaUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly mfaSessionRepo: IMfaSessionRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(credentials: LoginDto): Promise<{ sessionId: string }> {
    const user = await this.userRepo.findByEmail(credentials.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedError(
        'Invalid email or password.',
        'auth.invalidEmailOrPassword',
      );
    }

    const isPasswordValid = await comparePassword(
      credentials.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        'Invalid email or password.',
        'auth.invalidEmailOrPassword',
      );
    }

    if (!user.emailVerified) {
      throw new ForbiddenError(
        'Please verify your email before signing in. Check your inbox for the verification link.',
        'auth.emailNotVerified',
      );
    }

    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const session = await this.mfaSessionRepo.create({
      userId: user.userId,
      mfaCodeHash: hashToken(mfaCode),
      expiresAt,
    });

    await this.emailService.sendMfaCodeEmail(user.email, mfaCode, user.locale);

    return { sessionId: session.sessionId };
  }
}
