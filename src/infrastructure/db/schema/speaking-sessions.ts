import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { speakingTopics } from './speaking-topics';
import { users } from './users';

export const speakingSessions = pgTable(
  'speaking_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => speakingTopics.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('in_progress'),
    durationSeconds: integer('duration_seconds').notNull(),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    feedback: jsonb('feedback').$type<{
      overall_score: number;
      strengths: string[];
      grammar_errors: Array<{
        what_student_said: string;
        correction: string;
        explanation: string;
      }>;
      pronunciation_notes: string[];
      vocabulary_used: Array<{
        word: string;
        context: string;
        is_native_expression: boolean;
      }>;
      improvement_suggestions: string[];
      encouragement_message: string;
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('ss_user_idx').on(t.userId),
    index('ss_user_created_idx').on(t.userId, t.createdAt),
    index('ss_topic_idx').on(t.topicId),
  ],
);
