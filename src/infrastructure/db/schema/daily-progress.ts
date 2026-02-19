import {
  date,
  index,
  integer,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const dailyProgress = pgTable(
  'daily_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    practiceDate: date('practice_date').notNull(),
    readingMinutes: integer('reading_minutes').notNull().default(0),
    listeningMinutes: integer('listening_minutes').notNull().default(0),
    speakingMinutes: integer('speaking_minutes').notNull().default(0),
    lessonMinutes: integer('lesson_minutes').notNull().default(0),
    wordsPracticed: integer('words_practiced').notNull().default(0),
    wordsMastered: integer('words_mastered').notNull().default(0),
    avgPronunciationScore: real('avg_pronunciation_score'),
    exercisesCompleted: integer('exercises_completed').notNull().default(0),
    exercisesCorrect: integer('exercises_correct').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('dp_user_date_unique').on(t.userId, t.practiceDate),
    index('dp_user_date_idx').on(t.userId, t.practiceDate),
  ],
);
