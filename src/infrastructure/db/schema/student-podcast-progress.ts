import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { podcasts } from './podcasts';
import { users } from './users';

export const studentPodcastProgress = pgTable(
  'student_podcast_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    podcastId: uuid('podcast_id')
      .notNull()
      .references(() => podcasts.id, { onDelete: 'cascade' }),
    listenedPercentage: integer('listened_percentage').notNull().default(0),
    completedAt: timestamp('completed_at'),
    exerciseScore: integer('exercise_score'),
    totalQuestions: integer('total_questions'),
    exerciseCompletedAt: timestamp('exercise_completed_at'),
    exerciseAnswers:
      jsonb('exercise_answers').$type<
        Array<{ questionNumber: number; answer: string }>
      >(),
    exerciseFeedback: jsonb('exercise_feedback').$type<{
      perQuestion?: Array<{
        questionNumber: number;
        correct: boolean;
        explanation: string;
        studentAnswer?: string;
        correctAnswer?: string;
      }>;
      overallFeedback?: string;
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('spp_user_podcast_idx').on(t.userId, t.podcastId),
    index('spp_user_idx').on(t.userId),
  ],
);
