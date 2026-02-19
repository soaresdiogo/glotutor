import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { audioLessons } from './audio-lessons';
import { users } from './users';

export const listeningSessions = pgTable(
  'listening_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    audioLessonId: uuid('audio_lesson_id')
      .notNull()
      .references(() => audioLessons.id),
    durationListenedSeconds: integer('duration_listened_seconds'),
    completionPercentage: real('completion_percentage'),
    correctAnswers: integer('correct_answers').notNull().default(0),
    totalQuestions: integer('total_questions').notNull().default(0),
    comprehensionScore: real('comprehension_score'),
    answers: jsonb('answers'),
    aiFeedback: text('ai_feedback'),
    status: varchar('status', { length: 20 }).notNull().default('in_progress'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('ls_user_idx').on(t.userId),
    index('ls_user_created_idx').on(t.userId, t.createdAt),
  ],
);
