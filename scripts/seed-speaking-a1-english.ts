/**
 * Seed the first A1 speaking topic and exercises for English.
 *
 * Usage:
 *   npx tsx scripts/seed-speaking-a1-english.ts
 *
 * Requires DATABASE_URL in .env (or .env.local). Run migrations first: npm run db:migrate
 */

import * as path from 'node:path';

import dotenv from 'dotenv';
import { and, eq } from 'drizzle-orm';

// Load env before any imports that read process.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Avoid getServerEnv() failing when JWT keys are missing (e.g. CI or minimal .env)
if (!process.env.JWT_PRIVATE_KEY && !process.env.PRIVATE_KEY) {
  process.env.JWT_PRIVATE_KEY = 'cli-unused';
}
if (!process.env.JWT_PUBLIC_KEY && !process.env.PUBLIC_KEY) {
  process.env.JWT_PUBLIC_KEY = 'cli-unused';
}

async function main() {
  const { db } = await import('@/infrastructure/db/client');
  const { speakingTopics } = await import(
    '@/infrastructure/db/schema/speaking-topics'
  );
  const { speakingExercises } = await import(
    '@/infrastructure/db/schema/speaking-exercises'
  );
  const { supportedLanguages } = await import(
    '@/infrastructure/db/schema/supported-languages'
  );

  // Resolve English language
  const [enLang] = await db
    .select({ id: supportedLanguages.id })
    .from(supportedLanguages)
    .where(eq(supportedLanguages.code, 'en'))
    .limit(1);

  if (!enLang) {
    console.error(
      'English language not found in supported_languages. Add it first (e.g. via a seed or migration).',
    );
    process.exit(1);
  }

  const languageId = enLang.id;

  // Check if we already have this topic (slug + language)
  const slug = 'greetings-and-introductions';
  const existing = await db
    .select({ id: speakingTopics.id })
    .from(speakingTopics)
    .where(
      and(
        eq(speakingTopics.slug, slug),
        eq(speakingTopics.languageId, languageId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    console.log(
      `Topic "${slug}" already exists (id: ${existing[0]?.id}). Skipping insert.`,
    );
    process.exit(0);
  }

  const topicPayload = {
    languageId,
    slug,
    title: 'Greetings and introductions',
    description:
      'Practice saying hello, introducing yourself, and asking how someone is. Short, simple phrases for A1 learners.',
    cefrLevel: 'A1',
    contextPrompt: `You are a friendly English tutor. The student is A1 (beginner). 
Keep sentences short and simple. Use present simple and basic vocabulary.
Topic: greetings and introductions. 
Encourage the student to say: "Hello", "My name is...", "Nice to meet you", "How are you?", "I'm fine, thank you."
Correct gently and repeat the correct form once.`,
    keyVocabulary: [
      'hello',
      'hi',
      'name',
      'nice to meet you',
      'how are you',
      "I'm fine",
      'thank you',
    ],
    nativeExpressions: ["What's up?", "How's it going?"],
    sortOrder: 0,
  };

  const [insertedTopic] = await db
    .insert(speakingTopics)
    .values(topicPayload)
    .returning({ id: speakingTopics.id });

  if (!insertedTopic) {
    console.error('Failed to insert topic.');
    process.exit(1);
  }

  const topicId = insertedTopic.id;
  console.log(`Inserted topic: ${topicPayload.title} (id: ${topicId})`);

  const exercisesPayload = [
    {
      topicId,
      questionNumber: 1,
      type: 'fill_blank' as const,
      questionText: 'Complete: "_____ name is Maria."',
      options: null,
      correctAnswer: JSON.stringify({
        primary: 'My',
        alternatives: ["My name's"],
      }),
      explanationText:
        '"My name is..." is the standard way to introduce yourself.',
    },
    {
      topicId,
      questionNumber: 2,
      type: 'multiple_choice' as const,
      questionText: 'Which is a correct reply to "How are you?"',
      options: ['I am fine, thank you.', 'How are you?', 'Hello.'],
      correctAnswer: 'I am fine, thank you.',
      explanationText:
        '"I am fine, thank you." (or "I\'m fine, thanks") is the typical reply.',
    },
    {
      topicId,
      questionNumber: 3,
      type: 'fill_blank' as const,
      questionText: 'Complete: "_____ to meet you."',
      options: null,
      correctAnswer: 'Nice',
      explanationText:
        'We say "Nice to meet you" when we meet someone for the first time.',
    },
    {
      topicId,
      questionNumber: 4,
      type: 'reorder_sentence' as const,
      questionText: 'Put the words in order: you / meet / to / Nice',
      options: null,
      correctAnswer: 'Nice to meet you',
      explanationText: 'The correct order is "Nice to meet you."',
    },
  ];

  await db.insert(speakingExercises).values(exercisesPayload);
  console.log(`Inserted ${exercisesPayload.length} exercises.`);
  console.log(
    'Done. You can now use the Speaking module with this A1 English topic.',
  );
}

main().catch((err: unknown) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  if (err instanceof Error && err.stack) console.error(err.stack);
  const msg = err instanceof Error ? err.message : String(err);
  if (
    typeof msg === 'string' &&
    (msg.includes('relation') ||
      msg.includes('supported_languages') ||
      msg.includes('DATABASE'))
  ) {
    console.error(
      '\nTip: Set DATABASE_URL and run migrations: npm run db:migrate',
    );
  }
  process.exit(1);
});
