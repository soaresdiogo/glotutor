import type {
  ITextRepository,
  ReadingTextDetailEntity,
} from '@/features/reading/domain/repositories/text-repository.interface';
import { NotFoundError } from '@/shared/lib/errors';

export interface IGetReadingTextDetailUseCase {
  execute(userId: string, textId: string): Promise<ReadingTextDetailEntity>;
}

export class GetReadingTextDetailUseCase
  implements IGetReadingTextDetailUseCase
{
  constructor(private readonly textRepo: ITextRepository) {}

  async execute(
    _userId: string,
    textId: string,
  ): Promise<ReadingTextDetailEntity> {
    const detail = await this.textRepo.findPublishedDetailById(textId);
    if (!detail) {
      throw new NotFoundError('Text not found.', 'reading.api.textNotFound');
    }
    return detail;
  }
}
