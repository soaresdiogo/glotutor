import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { certificationExams } from './certification-exams';
import { placementTestQuestions } from './placement-test-questions';

export const certificationExamAnswers = pgTable(
  'certification_exam_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    examId: uuid('exam_id')
      .notNull()
      .references(() => certificationExams.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => placementTestQuestions.id, { onDelete: 'cascade' }),
    selectedOptionIndex: integer('selected_option_index').notNull(),
    isCorrect: boolean('is_correct').notNull(),
    answeredAt: timestamp('answered_at').notNull().defaultNow(),
  },
  (t) => [index('cea_exam_idx').on(t.examId)],
);
