import type {
  IReadingSessionRepository,
  LastSessionResult,
} from '@/features/reading/domain/repositories/reading-session-repository.interface';
import type { GetLastSessionDto } from '../dto/get-last-session.dto';

export interface IGetLastSessionUseCase {
  execute(
    userId: string,
    dto: GetLastSessionDto,
  ): Promise<LastSessionResult | null>;
}

export class GetLastSessionUseCase implements IGetLastSessionUseCase {
  constructor(private readonly sessionRepo: IReadingSessionRepository) {}

  async execute(
    userId: string,
    dto: GetLastSessionDto,
  ): Promise<LastSessionResult | null> {
    return this.sessionRepo.findLatestCompletedByUserAndText(
      userId,
      dto.textId,
    );
  }
}
