import type { ProgressResultEntity } from '@/features/progress/domain/entities/progress-result.entity';
import type { IProgressRepository } from '@/features/progress/domain/repositories/progress-repository.interface';

export interface IGetProgressUseCase {
  execute(userId: string): Promise<ProgressResultEntity>;
}

export class GetProgressUseCase implements IGetProgressUseCase {
  constructor(private readonly progressRepository: IProgressRepository) {}

  async execute(userId: string): Promise<ProgressResultEntity> {
    return this.progressRepository.getProgressByUserId(userId);
  }
}
