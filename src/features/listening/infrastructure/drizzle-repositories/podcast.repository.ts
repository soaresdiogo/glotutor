import { and, eq, inArray, sql } from 'drizzle-orm';
import type { PodcastEntity } from '@/features/listening/domain/entities/podcast.entity';
import type { PodcastExerciseEntity } from '@/features/listening/domain/entities/podcast-exercise.entity';
import type {
  IPodcastRepository,
  PodcastDetailEntity,
  PodcastListItemEntity,
} from '@/features/listening/domain/repositories/podcast-repository.interface';
import { podcastExercises } from '@/infrastructure/db/schema/podcast-exercises';
import { podcasts } from '@/infrastructure/db/schema/podcasts';
import { studentPodcastProgress } from '@/infrastructure/db/schema/student-podcast-progress';
import { supportedLanguages } from '@/infrastructure/db/schema/supported-languages';
import type { DbClient } from '@/infrastructure/db/types';

export class PodcastRepository implements IPodcastRepository {
  constructor(private readonly dbClient: DbClient) {}

  async findLanguageIdByCode(languageCode: string): Promise<string | null> {
    const codePrefix = languageCode.split('-')[0];
    const lang = await this.dbClient.query.supportedLanguages.findFirst({
      where: (t, { like }) => like(t.code, `${codePrefix}%`),
      columns: { id: true },
    });
    return lang?.id ?? null;
  }

  async findManyByLanguageAndLevel(
    languageCode: string,
    cefrLevel: string,
    userId: string,
  ): Promise<PodcastListItemEntity[]> {
    const codePrefix = languageCode.split('-')[0];
    const languages = await this.dbClient.query.supportedLanguages.findMany({
      where: (t, { like }) => like(t.code, `${codePrefix}%`),
      columns: { id: true },
    });
    const languageIds = languages.map((l) => l.id);
    if (languageIds.length === 0) return [];

    const rows = await this.dbClient.query.podcasts.findMany({
      where: and(
        inArray(podcasts.languageId, languageIds),
        eq(podcasts.cefrLevel, cefrLevel),
      ),
      columns: {
        id: true,
        title: true,
        description: true,
        cefrLevel: true,
        durationSeconds: true,
        createdAt: true,
        languageId: true,
      },
      with: { language: { columns: { code: true } } },
    });

    const progressRows =
      await this.dbClient.query.studentPodcastProgress.findMany({
        where: and(
          eq(studentPodcastProgress.userId, userId),
          inArray(
            studentPodcastProgress.podcastId,
            rows.map((r) => r.id),
          ),
        ),
        columns: {
          podcastId: true,
          listenedPercentage: true,
          exerciseScore: true,
          totalQuestions: true,
          exerciseCompletedAt: true,
        },
      });
    const progressByPodcast = new Map(
      progressRows.map((p) => [p.podcastId, p]),
    );

    const podcastIds = rows.map((r) => r.id);
    const countRows =
      podcastIds.length > 0
        ? await this.dbClient
            .select({
              podcastId: podcastExercises.podcastId,
              count: sql<number>`count(*)::int`,
            })
            .from(podcastExercises)
            .where(inArray(podcastExercises.podcastId, podcastIds))
            .groupBy(podcastExercises.podcastId)
        : [];
    const exerciseCountByPodcast = new Map(
      countRows.map((c) => [c.podcastId, c.count]),
    );

    return rows.map((r) => {
      const p = progressByPodcast.get(r.id);
      const exerciseCount = exerciseCountByPodcast.get(r.id) ?? 0;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        languageCode: r.language?.code ?? languageCode,
        cefrLevel: r.cefrLevel,
        durationSeconds: r.durationSeconds,
        createdAt: r.createdAt,
        exerciseCount,
        progress: p
          ? {
              listenedPercentage: p.listenedPercentage,
              exerciseScore: p.exerciseScore,
              totalQuestions: p.totalQuestions ?? undefined,
              exerciseCompletedAt: p.exerciseCompletedAt,
            }
          : undefined,
      };
    });
  }

  async findDetailById(
    podcastId: string,
    userId: string,
  ): Promise<PodcastDetailEntity | null> {
    const podcast = await this.dbClient.query.podcasts.findFirst({
      where: eq(podcasts.id, podcastId),
      with: {
        language: { columns: { code: true } },
        exercises: { orderBy: (t, { asc }) => [asc(t.questionNumber)] },
      },
    });
    if (!podcast) return null;

    const progress = await this.dbClient.query.studentPodcastProgress.findFirst(
      {
        where: and(
          eq(studentPodcastProgress.userId, userId),
          eq(studentPodcastProgress.podcastId, podcastId),
        ),
      },
    );

    return {
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      languageCode: podcast.language?.code ?? 'en',
      cefrLevel: podcast.cefrLevel,
      audioUrl: podcast.audioUrl,
      transcript: podcast.transcript,
      durationSeconds: podcast.durationSeconds,
      vocabularyHighlights: podcast.vocabularyHighlights ?? [],
      createdAt: podcast.createdAt,
      updatedAt: podcast.updatedAt,
      exercises: (podcast.exercises ?? [])
        .slice()
        .sort((a, b) => a.questionNumber - b.questionNumber)
        .map((e) => ({
          id: e.id,
          podcastId: e.podcastId,
          questionNumber: e.questionNumber,
          type: e.type as PodcastExerciseEntity['type'],
          questionText: e.questionText,
          options: e.options,
          correctAnswer: e.correctAnswer,
          explanationText: e.explanationText,
        })),
      progress: progress
        ? {
            listenedPercentage: progress.listenedPercentage,
            exerciseScore: progress.exerciseScore,
            totalQuestions: progress.totalQuestions ?? null,
            exerciseCompletedAt: progress.exerciseCompletedAt,
            exerciseAnswers: progress.exerciseAnswers ?? null,
            exerciseFeedback: progress.exerciseFeedback ?? null,
          }
        : undefined,
    };
  }

  async findById(podcastId: string): Promise<PodcastEntity | null> {
    const row = await this.dbClient.query.podcasts.findFirst({
      where: eq(podcasts.id, podcastId),
      with: { language: { columns: { code: true } } },
    });
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      languageCode: row.language?.code ?? 'en',
      cefrLevel: row.cefrLevel,
      audioUrl: row.audioUrl,
      transcript: row.transcript,
      durationSeconds: row.durationSeconds,
      vocabularyHighlights: row.vocabularyHighlights ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async create(podcast: {
    languageId: string;
    title: string;
    description: string;
    cefrLevel: string;
    audioUrl: string;
    transcript: string;
    durationSeconds: number;
    vocabularyHighlights: Array<{ word: string; translation: string }>;
  }): Promise<PodcastEntity> {
    const [inserted] = await this.dbClient
      .insert(podcasts)
      .values({
        languageId: podcast.languageId,
        title: podcast.title,
        description: podcast.description,
        cefrLevel: podcast.cefrLevel,
        audioUrl: podcast.audioUrl,
        transcript: podcast.transcript,
        durationSeconds: podcast.durationSeconds,
        vocabularyHighlights: podcast.vocabularyHighlights,
      })
      .returning();
    if (!inserted) throw new Error('Failed to create podcast');
    const lang = await this.dbClient.query.supportedLanguages.findFirst({
      where: eq(supportedLanguages.id, inserted.languageId),
      columns: { code: true },
    });
    return {
      id: inserted.id,
      title: inserted.title,
      description: inserted.description,
      languageCode: lang?.code ?? 'en',
      cefrLevel: inserted.cefrLevel,
      audioUrl: inserted.audioUrl,
      transcript: inserted.transcript,
      durationSeconds: inserted.durationSeconds,
      vocabularyHighlights: inserted.vocabularyHighlights ?? [],
      createdAt: inserted.createdAt,
      updatedAt: inserted.updatedAt,
    };
  }

  async createExercises(
    podcastId: string,
    exercises: Array<{
      questionNumber: number;
      type: string;
      questionText: string;
      options: string[] | null;
      correctAnswer: string;
      explanationText: string;
    }>,
  ): Promise<PodcastExerciseEntity[]> {
    if (exercises.length === 0) return [];
    const inserted = await this.dbClient
      .insert(podcastExercises)
      .values(
        exercises.map((e) => ({
          podcastId,
          questionNumber: e.questionNumber,
          type: e.type,
          questionText: e.questionText,
          options: e.options,
          correctAnswer: e.correctAnswer,
          explanationText: e.explanationText,
        })),
      )
      .returning();
    return inserted.map((e) => ({
      id: e.id,
      podcastId: e.podcastId,
      questionNumber: e.questionNumber,
      type: e.type as PodcastExerciseEntity['type'],
      questionText: e.questionText,
      options: e.options,
      correctAnswer: e.correctAnswer,
      explanationText: e.explanationText,
    }));
  }
}
