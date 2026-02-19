import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const jwtKeys = pgTable('jwt_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(),
  algorithm: varchar('algorithm', { length: 10 }).notNull().default('RS256'),
  kid: varchar('kid', { length: 100 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  rotatedAt: timestamp('rotated_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
