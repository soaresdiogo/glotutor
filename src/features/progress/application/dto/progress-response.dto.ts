/** API response DTO for GET /api/progress */

export type ProgressOverviewDto = {
  currentLevel: string;
  streakDays: number;
  totalPracticeMinutes: number;
  totalWordsLearned: number;
  lastPracticeDate: string | null;
  totalXp: number;
  thisWeekMinutes: number;
  lastActivityAt: string | null;
};

export type InProgressLessonDto = {
  lessonId: string;
  title: string;
  level: string;
  progressPercent: number;
  startedAt: string;
};

export type CompletedNativeLessonDto = {
  id: string;
  lessonId: string;
  title: string;
  level: string;
  score: number | null;
  completedAt: string;
};

export type CompletedListeningDto = {
  id: string;
  podcastId: string;
  title: string;
  level: string;
  exerciseScore: number | null;
  completedAt: string;
};

export type CompletedReadingDto = {
  id: string;
  textId: string;
  title: string;
  completedAt: string;
  wordsPerMinute: number | null;
  accuracy: number | null;
};

export type CompletedSpeakingDto = {
  id: string;
  topicId: string;
  title: string;
  completedAt: string;
};

export type ProgressResponseDto = {
  overview: ProgressOverviewDto;
  inProgressLesson: InProgressLessonDto | null;
  nativeLessons: CompletedNativeLessonDto[];
  listening: CompletedListeningDto[];
  reading: CompletedReadingDto[];
  speaking: CompletedSpeakingDto[];
};
