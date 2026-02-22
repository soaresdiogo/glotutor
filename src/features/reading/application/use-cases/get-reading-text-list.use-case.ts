import type {
  GetTextsForUserParams,
  IReadingTextListProvider,
  ReadingTextListItemEntity,
} from '@/features/reading/domain/ports/reading-text-list-provider.interface';

export type GetReadingTextListResult =
  | { kind: 'cached'; body: string }
  | { kind: 'fresh'; texts: ReadingTextListItemEntity[] };

export interface IGetReadingTextListUseCase {
  execute(
    userId: string,
    params?: GetTextsForUserParams,
  ): Promise<GetReadingTextListResult>;
}

export class GetReadingTextListUseCase implements IGetReadingTextListUseCase {
  constructor(private readonly textListProvider: IReadingTextListProvider) {}

  async execute(
    userId: string,
    params?: GetTextsForUserParams,
  ): Promise<GetReadingTextListResult> {
    return this.textListProvider.getTextsForUser(userId, params);
  }
}
