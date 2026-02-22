export type ReadingTextListItemEntity = {
  id: string;
  title: string;
  content: string;
  category: string;
  level: string;
  cefrLevel: string | null;
  wordCount: number | null;
  estimatedMinutes: number | null;
  languageCode: string;
};

export type GetTextsForUserResult =
  | { kind: 'cached'; body: string }
  | { kind: 'fresh'; texts: ReadingTextListItemEntity[] };

export type GetTextsForUserParams = {
  languageCode?: string;
  level?: string;
};

export interface IReadingTextListProvider {
  getTextsForUser(
    userId: string,
    params?: GetTextsForUserParams,
  ): Promise<GetTextsForUserResult>;
}
