export type CompletedReadingEntity = {
  id: string;
  textId: string;
  title: string;
  completedAt: string;
  wordsPerMinute: number | null;
  accuracy: number | null;
};
