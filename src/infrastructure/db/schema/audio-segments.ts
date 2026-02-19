import {
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  uuid,
} from 'drizzle-orm/pg-core';
import { audioLessons } from './audio-lessons';

export const audioSegments = pgTable(
  'audio_segments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    audioLessonId: uuid('audio_lesson_id')
      .notNull()
      .references(() => audioLessons.id, { onDelete: 'cascade' }),
    segmentIndex: integer('segment_index').notNull(),
    startTime: real('start_time').notNull(),
    endTime: real('end_time').notNull(),
    transcriptSegment: text('transcript_segment').notNull(),
    comprehensionQuestions: jsonb('comprehension_questions'),
  },
  (t) => [
    index('as_lesson_idx').on(t.audioLessonId),
    index('as_lesson_order_idx').on(t.audioLessonId, t.segmentIndex),
  ],
);
