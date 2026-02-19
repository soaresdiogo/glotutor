import {
  index,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { modules } from './modules';
import { users } from './users';

export const studentModuleProgress = pgTable(
  'student_module_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 20 }).notNull().default('locked'),
    progressPercentage: real('progress_percentage').notNull().default(0),
    unlockedAt: timestamp('unlocked_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('smp_user_module_unique').on(t.userId, t.moduleId),
    index('smp_user_idx').on(t.userId),
    index('smp_status_idx').on(t.userId, t.status),
  ],
);
