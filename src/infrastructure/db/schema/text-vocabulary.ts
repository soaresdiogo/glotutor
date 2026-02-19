import {
  index,
  integer,
  pgTable,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { texts } from './texts';

export const textVocabulary = pgTable(
  'text_vocabulary',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    textId: uuid('text_id')
      .notNull()
      .references(() => texts.id, { onDelete: 'cascade' }),
    word: varchar('word', { length: 100 }).notNull(),
    phoneticIpa: varchar('phonetic_ipa', { length: 200 }),
    definition: text('definition'),
    exampleSentence: text('example_sentence'),
    partOfSpeech: varchar('part_of_speech', { length: 20 }),
    cefrLevel: varchar('cefr_level', { length: 5 }),
    frequencyRank: integer('frequency_rank'),
    audioUrl: varchar('audio_url', { length: 500 }),
  },
  (t) => [index('tv_text_idx').on(t.textId)],
);
