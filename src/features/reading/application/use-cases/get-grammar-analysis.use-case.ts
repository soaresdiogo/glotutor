import type { GrammarItemEntity } from '@/features/reading/domain/entities/reading-session.entity';
import type { IGrammarAnalysisService } from '@/features/reading/domain/ports/grammar-analysis-service.interface';
import type { IStudentProfileRepository } from '@/features/reading/domain/repositories/student-profile-repository.interface';
import type { ITextRepository } from '@/features/reading/domain/repositories/text-repository.interface';
import { BadRequestError, NotFoundError } from '@/shared/lib/errors';

import type { GetGrammarAnalysisDto } from '../dto/get-grammar-analysis.dto';

export type GetGrammarAnalysisResult = {
  items: GrammarItemEntity[];
};

export interface IGetGrammarAnalysisUseCase {
  execute(
    userId: string,
    dto: GetGrammarAnalysisDto,
  ): Promise<GetGrammarAnalysisResult>;
}

export class GetGrammarAnalysisUseCase implements IGetGrammarAnalysisUseCase {
  constructor(
    private readonly grammarAI: IGrammarAnalysisService,
    private readonly textRepo: ITextRepository,
    private readonly profileRepo: IStudentProfileRepository,
  ) {}

  async execute(
    userId: string,
    dto: GetGrammarAnalysisDto,
  ): Promise<GetGrammarAnalysisResult> {
    let textContent: string;
    let studentLevel = dto.level ?? 'A1';
    let nativeLanguage = 'en';

    if (dto.textId) {
      const text = await this.textRepo.findContentById(dto.textId);
      if (!text) {
        throw new NotFoundError('Text not found.', 'reading.api.textNotFound');
      }
      textContent = text.content;
      const profile = await this.profileRepo.findForReadingByUserId(userId);
      if (profile) {
        studentLevel = profile.currentLevel;
        nativeLanguage = profile.nativeLanguageCode?.split('-')[0] ?? 'en';
      }
    } else if (dto.content && typeof dto.content === 'string') {
      textContent = dto.content;
      studentLevel = dto.level ?? 'A1';
      nativeLanguage = (dto.language as string)?.split('-')[0] ?? 'en';
    } else {
      throw new BadRequestError(
        'Provide text or content.',
        'reading.api.provideTextIdOrContent',
      );
    }

    const items = await this.grammarAI.analyze({
      textId: dto.textId,
      textContent,
      studentLevel,
      nativeLanguage,
    });
    return { items };
  }
}
