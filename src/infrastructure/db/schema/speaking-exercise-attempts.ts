import {
  boolean,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { speakingExercises } from './speaking-exercises';
import { speakingSessions } from './speaking-sessions';
import { users } from './users';

export const speakingExerciseAttempts = pgTable(
  'speaking_exercise_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => speakingSessions.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => speakingExercises.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    answer: jsonb('answer').$type<string | string[] | Record<string, string>>(),
    isCorrect: boolean('is_correct').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('sea_session_idx').on(t.sessionId),
    index('sea_session_exercise_idx').on(t.sessionId, t.exerciseId),
  ],
);
