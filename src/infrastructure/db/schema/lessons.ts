import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { modules } from './modules';

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    type: varchar('type', { length: 20 }).notNull().default('mixed'),
    estimatedMinutes: integer('estimated_minutes'),
    status: varchar('status', { length: 20 }).notNull().default('draft'),
    content: jsonb('content'),
    exerciseTemplates: jsonb('exercise_templates'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('lessons_module_idx').on(t.moduleId),
    index('lessons_sort_idx').on(t.moduleId, t.sortOrder),
  ],
);
