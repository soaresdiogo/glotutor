/**
 * Seed script for placement test and certification questions.
 * Run: npx tsx scripts/seed-placement-questions.ts
 *
 * Uses placement-question-content.ts for placement pool: 5 questions per (language, level, type)
 * so the adaptive test can ask 3 different questions per level. Certification pool gets
 * one placeholder per (language, level, type) for now.
 */
import { and, eq, like, or } from 'drizzle-orm';
import { db } from '../src/infrastructure/db/client';
import { placementTestQuestions } from '../src/infrastructure/db/schema/placement-test-questions';
import { PLACEMENT_QUESTIONS } from './placement-question-content';

/** Remove old placement questions that ask to "listen to audio" with no real content. */
async function removeOldPlaceholderPlacementQuestions() {
  const deleted = await db
    .delete(placementTestQuestions)
    .where(
      and(
        eq(placementTestQuestions.questionPool, 'placement'),
        or(
          like(placementTestQuestions.questionText, '%Listen to the audio%'),
          like(placementTestQuestions.questionText, '%This is a placeholder%'),
        ),
      ),
    );
  const count = deleted.rowCount ?? 0;
  if (count > 0) {
    console.log(
      `Removed ${count} old placeholder placement question(s) (no-audio listening).`,
    );
  }
}

const LANGUAGES = ['en', 'pt', 'es', 'it', 'fr', 'de'] as const;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const QUESTION_TYPES = [
  'reading_comprehension',
  'vocabulary',
  'listening',
] as const;

/** Single placeholder for certification (one per lang/level/type). */
function getCertificationPlaceholder(questionType: string): {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
} {
  switch (questionType) {
    case 'reading_comprehension':
      return {
        questionText:
          'Certification reading question. Read the text and choose the correct answer.',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
      };
    case 'vocabulary':
      return {
        questionText:
          'Certification vocabulary question. Choose the best answer.',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
      };
    case 'listening':
      return {
        questionText:
          'Certification listening question. Choose the best response. (Audio placeholder.)',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
      };
    default:
      return {
        questionText: 'What is the correct answer?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: 0,
      };
  }
}

async function seedPlacementPool() {
  await removeOldPlaceholderPlacementQuestions();
  for (const language of LANGUAGES) {
    for (const level of LEVELS) {
      for (const questionType of QUESTION_TYPES) {
        const contents = PLACEMENT_QUESTIONS[level]?.[questionType] ?? [];
        for (const content of contents) {
          const existing = await db.query.placementTestQuestions.findFirst({
            where: and(
              eq(placementTestQuestions.language, language),
              eq(placementTestQuestions.cefrLevel, level),
              eq(placementTestQuestions.questionType, questionType),
              eq(placementTestQuestions.questionPool, 'placement'),
              eq(placementTestQuestions.questionText, content.questionText),
            ),
          });
          if (existing) continue;

          await db.insert(placementTestQuestions).values({
            language,
            cefrLevel: level,
            questionType,
            questionPool: 'placement',
            questionText: content.questionText,
            audioUrl: null,
            options: content.options,
            correctOptionIndex: content.correctOptionIndex,
          });
        }
      }
    }
  }
  console.log('Placement test questions seed done.');
}

async function seedCertificationPool() {
  for (const language of LANGUAGES) {
    for (const level of LEVELS) {
      for (const questionType of QUESTION_TYPES) {
        const existing = await db.query.placementTestQuestions.findFirst({
          where: and(
            eq(placementTestQuestions.language, language),
            eq(placementTestQuestions.cefrLevel, level),
            eq(placementTestQuestions.questionType, questionType),
            eq(placementTestQuestions.questionPool, 'certification'),
          ),
        });
        if (existing) continue;

        const { questionText, options, correctOptionIndex } =
          getCertificationPlaceholder(questionType);
        await db.insert(placementTestQuestions).values({
          language,
          cefrLevel: level,
          questionType,
          questionPool: 'certification',
          questionText,
          audioUrl: null,
          options,
          correctOptionIndex,
        });
      }
    }
  }
  console.log('Certification questions seed done.');
}

async function seed() {
  await seedPlacementPool();
  await seedCertificationPool();
  console.log('All question seeds done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
