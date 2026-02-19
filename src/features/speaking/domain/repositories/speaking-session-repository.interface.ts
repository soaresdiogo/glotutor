import type {
  SpeakingFeedbackEntity,
  SpeakingSessionEntity,
} from '../entities/speaking-session.entity';

export interface ISpeakingSessionRepository {
  create(data: {
    userId: string;
    topicId: string;
    durationSeconds: number;
  }): Promise<SpeakingSessionEntity>;

  findById(sessionId: string): Promise<SpeakingSessionEntity | null>;

  findLastCompletedByTopicAndUser(
    topicId: string,
    userId: string,
  ): Promise<SpeakingSessionEntity | null>;

  findByIdWithTopic(sessionId: string): Promise<
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
  >;

  updateStatus(
    sessionId: string,
    status: 'in_progress' | 'completed',
  ): Promise<SpeakingSessionEntity | null>;

  updateCompleted(
    sessionId: string,
    feedback: SpeakingFeedbackEntity | null,
  ): Promise<SpeakingSessionEntity | null>;
}
