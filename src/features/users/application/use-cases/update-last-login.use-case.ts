import type { IUserRepository } from '@/features/users/domain/repositories/user-repository.interface';

export interface IUpdateUserLastLoginUseCase {
  execute(userId: string): Promise<void>;
}

export class UpdateUserLastLoginUseCase implements IUpdateUserLastLoginUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepo.updateLastLoginAt(userId);
  }
}
