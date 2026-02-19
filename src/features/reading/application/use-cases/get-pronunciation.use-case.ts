import type { IPronunciationService } from '@/features/reading/domain/ports/pronunciation-service.interface';

export type GetPronunciationResult = {
  audioUrl: string;
};

export interface IGetPronunciationUseCase {
  execute(
    _userId: string,
    word: string,
    languageCode: string,
  ): Promise<GetPronunciationResult>;
}

export class GetPronunciationUseCase implements IGetPronunciationUseCase {
  constructor(private readonly pronunciationService: IPronunciationService) {}

  async execute(
    _userId: string,
    word: string,
    languageCode: string,
  ): Promise<GetPronunciationResult> {
    const audioUrl = await this.pronunciationService.getAudioUrl(
      word,
      languageCode,
    );
    return { audioUrl };
  }
}
