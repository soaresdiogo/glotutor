import type { DailyLimitDTO } from '@/features/native-lessons/application/dto/daily-limit.dto';
import type { INativeLessonProgressRepository } from '@/features/native-lessons/domain/repositories/native-lesson-progress.repository.interface';

export interface ICheckDailyLimitUseCase {
  execute(userId: string): Promise<DailyLimitDTO>;
}

export class CheckDailyLimitUseCase implements ICheckDailyLimitUseCase {
  constructor(
    private readonly progressRepo: INativeLessonProgressRepository,
    private readonly maxDailyLessons: number,
  ) {}

  async execute(userId: string): Promise<DailyLimitDTO> {
    const used = await this.progressRepo.countCompletedToday(userId);
    return {
      used,
      limit: this.maxDailyLessons,
      canStartNew: used < this.maxDailyLessons,
    };
  }
}
