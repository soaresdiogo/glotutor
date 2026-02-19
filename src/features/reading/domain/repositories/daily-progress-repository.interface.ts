export interface IDailyProgressRepository {
  addReadingProgress(
    userId: string,
    date: string,
    readingMinutes: number,
    wordsPracticed: number,
  ): Promise<void>;
}
