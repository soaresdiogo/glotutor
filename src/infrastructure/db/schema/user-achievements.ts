import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { achievements } from './achievements';
import { users } from './users';

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: uuid('achievement_id')
      .notNull()
      .references(() => achievements.id),
    unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('ua_user_ach_unique').on(t.userId, t.achievementId)],
);
