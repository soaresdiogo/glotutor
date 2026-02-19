/**
 * Seed script for placement test and certification questions.
 * Run: npx tsx scripts/seed-placement-questions.ts
 *
 * Seeds both placement pool (for placement test) and certification pool (for certification exam).
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../src/infrastructure/db/client';
import {
  placementTestQuestions,
  type QuestionPool,
} from '../src/infrastructure/db/schema/placement-test-questions';

const LANGUAGES = ['en', 'pt', 'es', 'it', 'fr', 'de'] as const;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const QUESTION_TYPES = [
  'reading_comprehension',
  'vocabulary',
  'listening',
] as const;

async function seedPool(pool: QuestionPool, label: string) {
  for (const language of LANGUAGES) {
    for (const level of LEVELS) {
      for (const questionType of QUESTION_TYPES) {
        const existing = await db.query.placementTestQuestions.findFirst({
          where: and(
            eq(placementTestQuestions.language, language),
            eq(placementTestQuestions.cefrLevel, level),
            eq(placementTestQuestions.questionType, questionType),
            eq(placementTestQuestions.questionPool, pool),
          ),
        });
        if (existing) continue;

        const prefix = pool === 'certification' ? 'Certification' : 'Placement';
        await db.insert(placementTestQuestions).values({
          language,
          cefrLevel: level,
          questionType,
          questionPool: pool,
          questionText: `${prefix} ${questionType.replace('_', ' ')} for ${language} ${level}. What is the correct answer?`,
          audioUrl: questionType === 'listening' ? null : null,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: 0,
        });
      }
    }
  }
  console.log(`${label} seed done.`);
}

async function seed() {
  await seedPool('placement', 'Placement test questions');
  await seedPool('certification', 'Certification questions');
  console.log('All question seeds done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
