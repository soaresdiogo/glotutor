import type { IWordDetailsService } from '@/features/reading/domain/ports/word-details-service.interface';
import type { IStudentProfileRepository } from '@/features/reading/domain/repositories/student-profile-repository.interface';

import type { GetWordDetailsDto } from '../dto/get-word-details.dto';

export type GetWordDetailsResult = {
  phoneticIpa: string | null;
  definition: string | null;
};

export interface IGetWordDetailsUseCase {
  execute(
    userId: string,
    dto: GetWordDetailsDto,
  ): Promise<GetWordDetailsResult>;
}

export class GetWordDetailsUseCase implements IGetWordDetailsUseCase {
  constructor(
    private readonly profileRepo: IStudentProfileRepository,
    private readonly wordDetailsService: IWordDetailsService,
  ) {}

  async execute(
    userId: string,
    dto: GetWordDetailsDto,
  ): Promise<GetWordDetailsResult> {
    const native =
      (
        await this.profileRepo.findForReadingByUserId(userId)
      )?.nativeLanguageCode?.split('-')[0] ?? 'en';
    return this.wordDetailsService.getWordDetails(
      dto.word,
      dto.textLanguageCode,
      native,
    );
  }
}
