export type PodcastEntity = {
  id: string;
  title: string;
  description: string;
  languageCode: string;
  cefrLevel: string;
  audioUrl: string;
  transcript: string;
  durationSeconds: number;
  vocabularyHighlights: Array<{ word: string; translation: string }>;
  createdAt: Date;
  updatedAt: Date;
};
