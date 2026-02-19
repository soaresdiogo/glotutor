import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';
import { verifyToken } from '@/shared/lib/auth/jwt';
import { UnauthorizedError } from '@/shared/lib/errors';

export type CurrentUser = { id: string; name: string; email: string };

export interface IGetCurrentUserUseCase {
  execute(refreshToken: string): Promise<CurrentUser>;
}

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(refreshToken: string): Promise<CurrentUser> {
    const { payload } = await verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError(
        'Invalid token type.',
        'auth.invalidTokenType',
      );
    }

    const user = await this.userRepo.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('User not found.', 'auth.userNotFound');
    }

    return {
      id: user.userId,
      name: user.name ?? user.email,
      email: user.email,
    };
  }
}
