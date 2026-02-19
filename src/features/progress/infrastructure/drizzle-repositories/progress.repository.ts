import { and, desc, eq, gte, isNotNull } from 'drizzle-orm';
import type { ProgressResultEntity } from '@/features/progress/domain/entities/progress-result.entity';
import type { IProgressRepository } from '@/features/progress/domain/repositories/progress-repository.interface';
import {
  type DailyProgressRow,
  type InProgressLessonRow,
  type ListeningRow,
  type NativeLessonProgressRow,
  type ProfileRow,
  ProgressMapper,
  type ReadingRow,
  type SpeakingRow,
} from '@/features/progress/infrastructure/mappers/progress.mapper';
import { dailyProgress } from '@/infrastructure/db/schema/daily-progress';
import { nativeLessonProgress } from '@/infrastructure/db/schema/native-lesson-progress';
import { nativeLessons as nativeLessonsTable } from '@/infrastructure/db/schema/native-lessons';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { readingSessions } from '@/infrastructure/db/schema/reading-sessions';
import { speakingSessions } from '@/infrastructure/db/schema/speaking-sessions';
import { speakingTopics } from '@/infrastructure/db/schema/speaking-topics';
import { studentPodcastProgress } from '@/infrastructure/db/schema/student-podcast-progress';
import { studentProfiles } from '@/infrastructure/db/schema/student-profiles';
import { texts } from '@/infrastructure/db/schema/texts';
import type { DbClient } from '@/infrastructure/db/types';

function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.toISOString().slice(0, 10);
}

export class ProgressRepository implements IProgressRepository {
  constructor(private readonly db: DbClient) {}

  async getProgressByUserId(userId: string): Promise<ProgressResultEntity> {
    const startOfWeekStr = getStartOfWeek();

    const profile = await this.db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, userId),
      columns: {
        currentLevel: true,
        streakDays: true,
        totalPracticeMinutes: true,
        totalWordsLearned: true,
        lastPracticeDate: true,
      },
    });

    const [
      nativeLessonsRows,
      listeningRows,
      readingRows,
      speakingRows,
      thisWeekRows,
      inProgressRows,
    ] = await Promise.all([
      this.db
        .select({
          id: nativeLessonProgress.id,
          lessonId: nativeLessonProgress.lessonId,
          title: nativeLessonsTable.title,
          level: nativeLessonsTable.level,
          score: nativeLessonProgress.score,
          completedAt: nativeLessonProgress.completedAt,
        })
        .from(nativeLessonProgress)
        .innerJoin(
          nativeLessonsTable,
          eq(nativeLessonProgress.lessonId, nativeLessonsTable.id),
        )
        .where(
          and(
            eq(nativeLessonProgress.userId, userId),
            eq(nativeLessonProgress.status, 'completed'),
            isNotNull(nativeLessonProgress.completedAt),
          ),
        )
        .orderBy(desc(nativeLessonProgress.completedAt))
        .limit(50)
        .then((rows) => rows as NativeLessonProgressRow[]),

      this.db
        .select({
          id: studentPodcastProgress.id,
          podcastId: studentPodcastProgress.podcastId,
          title: podcasts.title,
          level: podcasts.cefrLevel,
          exerciseScore: studentPodcastProgress.exerciseScore,
          completedAt: studentPodcastProgress.exerciseCompletedAt,
        })
        .from(studentPodcastProgress)
        .innerJoin(podcasts, eq(studentPodcastProgress.podcastId, podcasts.id))
        .where(
          and(
            eq(studentPodcastProgress.userId, userId),
            isNotNull(studentPodcastProgress.exerciseCompletedAt),
          ),
        )
        .orderBy(desc(studentPodcastProgress.exerciseCompletedAt))
        .limit(50)
        .then((rows) => rows as ListeningRow[]),

      this.db
        .select({
          id: readingSessions.id,
          textId: readingSessions.textId,
          title: texts.title,
          completedAt: readingSessions.completedAt,
          wordsPerMinute: readingSessions.wordsPerMinute,
          accuracy: readingSessions.accuracy,
        })
        .from(readingSessions)
        .innerJoin(texts, eq(readingSessions.textId, texts.id))
        .where(
          and(
            eq(readingSessions.userId, userId),
            isNotNull(readingSessions.completedAt),
          ),
        )
        .orderBy(desc(readingSessions.completedAt))
        .limit(50)
        .then((rows) => rows as ReadingRow[]),

      this.db
        .select({
          id: speakingSessions.id,
          topicId: speakingSessions.topicId,
          title: speakingTopics.title,
          completedAt: speakingSessions.completedAt,
        })
        .from(speakingSessions)
        .innerJoin(
          speakingTopics,
          eq(speakingSessions.topicId, speakingTopics.id),
        )
        .where(
          and(
            eq(speakingSessions.userId, userId),
            isNotNull(speakingSessions.completedAt),
          ),
        )
        .orderBy(desc(speakingSessions.completedAt))
        .limit(50)
        .then((rows) => rows as SpeakingRow[]),

      this.db
        .select({
          readingMinutes: dailyProgress.readingMinutes,
          listeningMinutes: dailyProgress.listeningMinutes,
          speakingMinutes: dailyProgress.speakingMinutes,
          lessonMinutes: dailyProgress.lessonMinutes,
        })
        .from(dailyProgress)
        .where(
          and(
            eq(dailyProgress.userId, userId),
            gte(dailyProgress.practiceDate, startOfWeekStr),
          ),
        )
        .then((rows) => rows as DailyProgressRow[]),

      this.db
        .select({
          lessonId: nativeLessonProgress.lessonId,
          title: nativeLessonsTable.title,
          level: nativeLessonsTable.level,
          exerciseResults: nativeLessonProgress.exerciseResults,
          startedAt: nativeLessonProgress.startedAt,
        })
        .from(nativeLessonProgress)
        .innerJoin(
          nativeLessonsTable,
          eq(nativeLessonProgress.lessonId, nativeLessonsTable.id),
        )
        .where(
          and(
            eq(nativeLessonProgress.userId, userId),
            eq(nativeLessonProgress.status, 'in_progress'),
          ),
        )
        .limit(1)
        .then((rows) => rows as InProgressLessonRow[]),
    ]);

    const thisWeekMinutes =
      thisWeekRows?.reduce(
        (sum, row) =>
          sum +
          (row.readingMinutes ?? 0) +
          (row.listeningMinutes ?? 0) +
          (row.speakingMinutes ?? 0) +
          (row.lessonMinutes ?? 0),
        0,
      ) ?? 0;

    const allCompletedDates = [
      ...nativeLessonsRows.map((r) => r.completedAt),
      ...listeningRows.map((r) => r.completedAt),
      ...readingRows.map((r) => r.completedAt),
      ...speakingRows.map((r) => r.completedAt),
    ].filter((d): d is NonNullable<typeof d> => d != null);
    const lastActivityAt =
      allCompletedDates.length > 0
        ? new Date(
            Math.max(...allCompletedDates.map((d) => d.getTime())),
          ).toISOString()
        : null;

    const profileRow: ProfileRow | null = profile
      ? {
          currentLevel: profile.currentLevel,
          streakDays: profile.streakDays,
          totalPracticeMinutes: profile.totalPracticeMinutes,
          totalWordsLearned: profile.totalWordsLearned,
          lastPracticeDate: profile.lastPracticeDate,
        }
      : null;

    const overview = ProgressMapper.toOverview(
      profileRow,
      thisWeekMinutes,
      lastActivityAt,
    );
    const inProgressLesson = ProgressMapper.toInProgressLesson(
      inProgressRows?.[0] ?? null,
    );
    const completedNativeLessons =
      ProgressMapper.toCompletedNativeLessons(nativeLessonsRows);
    const completedListening =
      ProgressMapper.toCompletedListening(listeningRows);
    const completedReading = ProgressMapper.toCompletedReading(readingRows);
    const completedSpeaking = ProgressMapper.toCompletedSpeaking(speakingRows);

    return ProgressMapper.toResult(
      overview,
      inProgressLesson,
      completedNativeLessons,
      completedListening,
      completedReading,
      completedSpeaking,
    );
  }
}
