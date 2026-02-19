import { and, desc, eq } from 'drizzle-orm';
import type {
  SpeakingFeedbackEntity,
  SpeakingSessionEntity,
} from '@/features/speaking/domain/entities/speaking-session.entity';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';
import { speakingSessions } from '@/infrastructure/db/schema/speaking-sessions';
import type { DbClient } from '@/infrastructure/db/types';

function mapRowToEntity(row: {
  id: string;
  userId: string;
  topicId: string;
  status: string;
  durationSeconds: number;
  startedAt: Date;
  completedAt: Date | null;
  feedback: SpeakingFeedbackEntity | null;
  createdAt: Date;
}): SpeakingSessionEntity {
  return {
    id: row.id,
    userId: row.userId,
    topicId: row.topicId,
    status: row.status as 'in_progress' | 'completed',
    durationSeconds: row.durationSeconds,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    feedback: row.feedback,
    createdAt: row.createdAt,
  };
}

export class SpeakingSessionRepository implements ISpeakingSessionRepository {
  constructor(private readonly dbClient: DbClient) {}

  async create(data: {
    userId: string;
    topicId: string;
    durationSeconds: number;
  }): Promise<SpeakingSessionEntity> {
    const [inserted] = await this.dbClient
      .insert(speakingSessions)
      .values({
        userId: data.userId,
        topicId: data.topicId,
        durationSeconds: data.durationSeconds,
      })
      .returning();
    if (!inserted) throw new Error('Failed to create speaking session');
    return mapRowToEntity(inserted);
  }

  async findById(sessionId: string): Promise<SpeakingSessionEntity | null> {
    const row = await this.dbClient.query.speakingSessions.findFirst({
      where: eq(speakingSessions.id, sessionId),
    });
    return row ? mapRowToEntity(row) : null;
  }

  async findLastCompletedByTopicAndUser(
    topicId: string,
    userId: string,
  ): Promise<SpeakingSessionEntity | null> {
    const [row] = await this.dbClient
      .select()
      .from(speakingSessions)
      .where(
        and(
          eq(speakingSessions.topicId, topicId),
          eq(speakingSessions.userId, userId),
          eq(speakingSessions.status, 'completed'),
        ),
      )
      .orderBy(
        desc(speakingSessions.completedAt),
        desc(speakingSessions.createdAt),
      )
      .limit(1);
    return row ? mapRowToEntity(row) : null;
  }

  async findByIdWithTopic(sessionId: string): Promise<
    | (SpeakingSessionEntity & {
        topic: {
          id: string;
          title: string;
          slug: string;
          cefrLevel: string;
          languageCode: string;
        };
      })
    | null
  > {
    const row = await this.dbClient.query.speakingSessions.findFirst({
      where: eq(speakingSessions.id, sessionId),
      with: {
        topic: {
          columns: {
            id: true,
            title: true,
            slug: true,
            cefrLevel: true,
            languageId: true,
          },
          with: { language: { columns: { code: true } } },
        },
      },
    });
    if (!row?.topic) return null;

    const topic = row.topic as typeof row.topic & {
      language?: { code: string };
    };
    return {
      ...mapRowToEntity(row),
      topic: {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        cefrLevel: topic.cefrLevel,
        languageCode: topic.language?.code ?? 'en',
      },
    };
  }

  async updateStatus(
    sessionId: string,
    status: 'in_progress' | 'completed',
  ): Promise<SpeakingSessionEntity | null> {
    const [updated] = await this.dbClient
      .update(speakingSessions)
      .set({
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      })
      .where(eq(speakingSessions.id, sessionId))
      .returning();
    return updated ? mapRowToEntity(updated) : null;
  }

  async updateCompleted(
    sessionId: string,
    feedback: SpeakingFeedbackEntity | null,
  ): Promise<SpeakingSessionEntity | null> {
    const [updated] = await this.dbClient
      .update(speakingSessions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        feedback,
      })
      .where(eq(speakingSessions.id, sessionId))
      .returning();
    return updated ? mapRowToEntity(updated) : null;
  }
}
