import type { CompletedListeningEntity } from '@/features/progress/domain/entities/completed-listening.entity';
import type { CompletedNativeLessonEntity } from '@/features/progress/domain/entities/completed-native-lesson.entity';
import type { CompletedReadingEntity } from '@/features/progress/domain/entities/completed-reading.entity';
import type { CompletedSpeakingEntity } from '@/features/progress/domain/entities/completed-speaking.entity';
import type { InProgressLessonEntity } from '@/features/progress/domain/entities/in-progress-lesson.entity';
import type { ProgressOverviewEntity } from '@/features/progress/domain/entities/progress-overview.entity';
import type { ProgressResultEntity } from '@/features/progress/domain/entities/progress-result.entity';

/** DB row types used by the progress repository */
export type ProfileRow = {
  currentLevel: string;
  streakDays: number;
  totalPracticeMinutes: number;
  totalWordsLearned: number;
  lastPracticeDate: string | null;
};

export type DailyProgressRow = {
  readingMinutes: number | null;
  listeningMinutes: number | null;
  speakingMinutes: number | null;
  lessonMinutes: number | null;
};

export type NativeLessonProgressRow = {
  id: string;
  lessonId: string;
  title: string;
  level: string;
  score: number | null;
  completedAt: Date | null;
};

export type InProgressLessonRow = {
  lessonId: string;
  title: string;
  level: string;
  exerciseResults: unknown;
  startedAt: Date | null;
};

export type ListeningRow = {
  id: string;
  podcastId: string;
  title: string;
  level: string;
  exerciseScore: number | null;
  completedAt: Date | null;
};

export type ReadingRow = {
  id: string;
  textId: string;
  title: string;
  completedAt: Date | null;
  wordsPerMinute: number | null;
  accuracy: number | null;
};

export type SpeakingRow = {
  id: string;
  topicId: string;
  title: string;
  completedAt: Date | null;
};

export const ProgressMapper = {
  toOverview(
    profile: ProfileRow | null,
    thisWeekMinutes: number,
    lastActivityAt: string | null,
  ): ProgressOverviewEntity {
    const totalXp =
      (profile?.totalPracticeMinutes ?? 0) * 12 +
      (profile?.totalWordsLearned ?? 0) * 2;
    return {
      currentLevel: profile?.currentLevel ?? 'A1',
      streakDays: profile?.streakDays ?? 0,
      totalPracticeMinutes: profile?.totalPracticeMinutes ?? 0,
      totalWordsLearned: profile?.totalWordsLearned ?? 0,
      lastPracticeDate: profile?.lastPracticeDate
        ? String(profile.lastPracticeDate)
        : null,
      totalXp,
      thisWeekMinutes,
      lastActivityAt,
    };
  },

  toInProgressLesson(
    row: InProgressLessonRow | null,
  ): InProgressLessonEntity | null {
    if (row == null) return null;
    const results = row.exerciseResults as unknown[] | null | undefined;
    const count = Array.isArray(results) ? results.length : 0;
    const progressPercent = Math.min(100, count * 15);
    return {
      lessonId: row.lessonId,
      title: row.title,
      level: row.level,
      progressPercent,
      startedAt: row.startedAt
        ? row.startedAt.toISOString()
        : new Date().toISOString(),
    };
  },

  toCompletedNativeLessons(
    rows: NativeLessonProgressRow[],
  ): CompletedNativeLessonEntity[] {
    return rows.map((r) => ({
      id: r.id,
      lessonId: r.lessonId,
      title: r.title,
      level: r.level,
      score: r.score,
      completedAt: r.completedAt
        ? r.completedAt.toISOString()
        : new Date().toISOString(),
    }));
  },

  toCompletedListening(rows: ListeningRow[]): CompletedListeningEntity[] {
    return rows.map((r) => ({
      id: r.id,
      podcastId: r.podcastId,
      title: r.title,
      level: r.level,
      exerciseScore: r.exerciseScore,
      completedAt: r.completedAt
        ? r.completedAt.toISOString()
        : new Date().toISOString(),
    }));
  },

  toCompletedReading(rows: ReadingRow[]): CompletedReadingEntity[] {
    return rows.map((r) => ({
      id: r.id,
      textId: r.textId,
      title: r.title,
      completedAt: r.completedAt
        ? r.completedAt.toISOString()
        : new Date().toISOString(),
      wordsPerMinute: r.wordsPerMinute,
      accuracy: r.accuracy,
    }));
  },

  toCompletedSpeaking(rows: SpeakingRow[]): CompletedSpeakingEntity[] {
    return rows.map((r) => ({
      id: r.id,
      topicId: r.topicId,
      title: r.title,
      completedAt: r.completedAt
        ? r.completedAt.toISOString()
        : new Date().toISOString(),
    }));
  },

  toResult(
    overview: ProgressOverviewEntity,
    inProgressLesson: InProgressLessonEntity | null,
    completedNativeLessons: CompletedNativeLessonEntity[],
    completedListening: CompletedListeningEntity[],
    completedReading: CompletedReadingEntity[],
    completedSpeaking: CompletedSpeakingEntity[],
  ): ProgressResultEntity {
    return {
      overview,
      inProgressLesson,
      completedNativeLessons,
      completedListening,
      completedReading,
      completedSpeaking,
    };
  },
};
