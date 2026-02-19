import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { supportedLanguages } from './supported-languages';
import { tenants } from './tenants';
import { users } from './users';

export const studentProfiles = pgTable(
  'student_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').references(() => tenants.id, {
      onDelete: 'set null',
    }),
    targetLanguageId: uuid('target_language_id')
      .notNull()
      .references(() => supportedLanguages.id),
    nativeLanguageCode: varchar('native_language_code', { length: 10 })
      .notNull()
      .default('pt-BR'),
    currentLevel: varchar('current_level', { length: 5 })
      .notNull()
      .default('A1'),
    learningGoal: varchar('learning_goal', { length: 30 }),
    streakDays: integer('streak_days').notNull().default(0),
    totalPracticeMinutes: integer('total_practice_minutes')
      .notNull()
      .default(0),
    totalWordsLearned: integer('total_words_learned').notNull().default(0),
    lastPracticeDate: date('last_practice_date'),
    preferences: jsonb('preferences'),
    onboardingAnswers: jsonb('onboarding_answers'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('sp_user_idx').on(t.userId),
    index('sp_tenant_idx').on(t.tenantId),
    index('sp_language_idx').on(t.targetLanguageId),
  ],
);
