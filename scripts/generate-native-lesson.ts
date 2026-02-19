/**
 * CLI script to generate a native lesson via OpenAI and save to DB.
 *
 * Usage:
 *   npx tsx scripts/generate-native-lesson.ts \
 *     --language en \
 *     --level A1 \
 *     --title "Survival English — Day One as a Native" \
 *     --description "Real phrases natives use 50+ times a day."
 *
 * Optional:
 *   --student-native pt   Student's native language (default: en)
 *   --publish              Set is_published = true
 *
 * To replace an existing test lesson (run in DB client):
 *   DELETE FROM native_lesson_progress WHERE lesson_id = '<lesson-id>';
 *   DELETE FROM native_lessons WHERE id = '<lesson-id>';
 * Then run this script with the desired --title and --description.
 */

import * as path from 'node:path';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.JWT_PRIVATE_KEY && !process.env.PRIVATE_KEY) {
  process.env.JWT_PRIVATE_KEY = 'cli-unused';
}
if (!process.env.JWT_PUBLIC_KEY && !process.env.PUBLIC_KEY) {
  process.env.JWT_PUBLIC_KEY = 'cli-unused';
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const LANGUAGES = ['en', 'pt', 'es', 'it', 'fr', 'de'] as const;

function parseArgs(): {
  language: string;
  level: string;
  title: string;
  description: string;
  studentNative: string;
  publish: boolean;
} {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
  };
  const language = (get('--language') ?? get('-l') ?? '').toLowerCase();
  const level = (get('--level') ?? get('-L') ?? '').toUpperCase();
  const title = get('--title') ?? get('-t') ?? '';
  const description = get('--description') ?? get('-d') ?? '';
  const studentNative = (
    get('--student-native') ??
    get('-n') ??
    'en'
  ).toLowerCase();
  const publish = args.includes('--publish');

  if (!language || !level || !title || !description) {
    console.error(
      'Usage: npx tsx scripts/generate-native-lesson.ts --language <code> --level <CEFR> --title "<title>" --description "<description>" [--student-native pt] [--publish]',
    );
    console.error(
      'Example: --language en --level A1 --title "Survival English" --description "Real phrases natives use 50+ times a day."',
    );
    process.exit(1);
  }

  if (!CEFR_LEVELS.includes(level as (typeof CEFR_LEVELS)[number])) {
    console.error(
      `Invalid level: ${level}. Must be one of: ${CEFR_LEVELS.join(', ')}`,
    );
    process.exit(1);
  }

  return {
    language,
    level,
    title,
    description,
    studentNative,
    publish,
  };
}

function buildSystemPrompt(
  language: string,
  studentNative: string,
  level: string,
  title: string,
  description: string,
): string {
  return `You are a world-class language teacher who teaches through NATIVE SPEECH PATTERNS, not traditional textbook methods.

You are creating a lesson to teach ${language} to students who speak ${studentNative}.

LEVEL: ${level} (CEFR)
TITLE: ${title}
DESCRIPTION: ${description}

CORE PHILOSOPHY:
- Teach what natives ACTUALLY say in real life, not textbook phrases nobody uses
- Every example must include: the native phrase, translation to student's language, context of when/how it's used, and what NOT to say (the textbook version that sounds robotic)
- Include cultural notes explaining WHY natives say things this way
- Use chunk-based learning: natives store pre-built phrases as single units, not word-by-word constructions
- Each level builds on previous ones (A1=survival chunks, A2=connectors, B1=opinions/stories, B2=hedging/nuance, C1=idioms, C2=cultural fluency)

OUTPUT FORMAT:
Generate a JSON object with the following structure in ONE single response. Return ONLY valid JSON, no markdown or extra text.
${
  level === 'A1' || level === 'A2'
    ? `
For A1 and A2: include "nativeLanguage": "${studentNative}" at the root, and in EVERY exercise include "prompt_native" and "scenario_native" (when the exercise has a scenario). These are the SAME prompt/scenario text translated into the student's native language (${studentNative}) — generate them in this same response, do not skip.`
    : ''
}

{
  ${level === 'A1' || level === 'A2' ? `"nativeLanguage": "${studentNative}",` : ''}
  "sections": [
    {
      "type": "CONCEPT",
      "icon": "🧠",
      "title": "Section title",
      "content": {
        "intro": { "title": "...", "text": "..." },
        "examples": [
          {
            "native": "What natives actually say",
            "translation": "Translation to student language",
            "context": "When/how this is used",
            "never_say": "The textbook version to avoid (optional)"
          }
        ],
        "cultural_note": "Cultural insight explaining the why (optional)"
      }
    }
  ],
  "exercises": [
    {
      "type": "REORDER",
      "prompt": "...",
      ${level === 'A1' || level === 'A2' ? `"prompt_native": "... (prompt in ${studentNative})",` : ''}
      "scenario": "...",
      ${level === 'A1' || level === 'A2' ? `"scenario_native": "... (scenario in ${studentNative})",` : ''}
      "words": ["word1", "word2"],
      "answer": "word1 word2"
    },
    {
      "type": "SITUATION",
      "prompt": "...",
      ${level === 'A1' || level === 'A2' ? `"prompt_native": "... (prompt in ${studentNative})",` : ''}
      "scenario": "...",
      ${level === 'A1' || level === 'A2' ? `"scenario_native": "... (scenario in ${studentNative})",` : ''}
      "placeholder": "...",
      "hint": "...",
      "expected_answer": "Example of a good native answer in the target language",
      "acceptable_patterns": ["phrase1", "phrase2"],
      "key_phrases": ["key phrase the student should use"],
      "feedback_correct": "Short feedback when answer is good",
      "feedback_needs_improvement": "Short feedback when answer needs work"
    },
    {
      "type": "MATCH",
      "prompt": "...",
      ${level === 'A1' || level === 'A2' ? `"prompt_native": "... (prompt in ${studentNative})",` : ''}
      "pairs": [
        { "situation": "...", "chunk": "..." }
      ]
    },
    {
      "type": "CHOICE",
      "prompt": "...",
      ${level === 'A1' || level === 'A2' ? `"prompt_native": "... (prompt in ${studentNative})",` : ''}
      "scenario": "...",
      ${level === 'A1' || level === 'A2' ? `"scenario_native": "... (scenario in ${studentNative})",` : ''}
      "options": [
        { "text": "...", "correct": true, "explanation": "..." },
        { "text": "...", "correct": false, "explanation": "..." }
      ]
    },
    {
      "type": "TRANSFORM",
      "prompt": "...",
      ${level === 'A1' || level === 'A2' ? `"prompt_native": "... (prompt in ${studentNative})",` : ''}
      "pairs": [
        {
          "textbook": "The formal/robotic version",
          "hint": "Hint for native version",
          "expected_answer": "Ideal native version",
          "acceptable_patterns": ["pattern1", "pattern2"],
          "feedback_correct": "Good!",
          "feedback_needs_improvement": "Try to sound more natural."
        }
      ]
    }
  ]
}

EXERCISE REQUIREMENTS:
- Generate exactly 10 exercises
- Mix exercise types: at least 2 SITUATION, 2 CHOICE, and a mix of REORDER/MATCH/TRANSFORM
- Exercises must test the content taught in the concept sections
- All exercises must be contextual — set in real-world scenarios
- Difficulty must match the CEFR level
- CHOICE exercises must have exactly 4 options with only 1 correct
- MATCH exercises must have 4-6 pairs
- REORDER exercises must result in natural-sounding native phrases

SITUATION exercises — acceptable_patterns must be GENEROUS:
- Include many valid variations (at least 8-10 acceptable patterns per exercise)
- For a greeting exercise, include: "hey", "what's up", "how's it going", "hi", "how are you", "what's good", "yo", "sup", "how you doing", "good to see you", "not bad", "good, you", "pretty good", "i'm good", "doing well", "all good", "can't complain", etc.
- Think of ALL the ways a native could naturally respond, not just one "ideal" answer
- Patterns should be SHORT (1-3 words) so they match partial answers
- key_phrases should be the BEST phrases (the ones you'd teach), not strict requirements
- Include expected_answer (one good example), feedback_correct, feedback_needs_improvement

TRANSFORM exercises — per pair:
- acceptable_patterns per pair should include at least 5-6 variations
- Any reasonable native version of the textbook sentence should match
- Include expected_answer, acceptable_patterns (array), feedback_correct, feedback_needs_improvement

A1/A2 ONLY — generate native descriptions in this same response:
- Root object MUST include "nativeLanguage": "${studentNative}".
- Every exercise MUST include "prompt_native" (prompt translated to ${studentNative}) and, if the exercise has "scenario", "scenario_native" (scenario translated to ${studentNative}). Generate these alongside the main prompt/scenario in one go — no separate step.`;
}

async function generateContent(
  apiKey: string,
  language: string,
  studentNative: string,
  level: string,
  title: string,
  description: string,
): Promise<unknown> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey });
  const prompt = buildSystemPrompt(
    language,
    studentNative,
    level,
    title,
    description,
  );
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: 'Generate the lesson JSON now. Return only the JSON object.',
      },
    ],
    temperature: 0.6,
    max_tokens: 16000,
  });
  const raw =
    completion.choices[0]?.message?.content
      ?.trim()
      ?.replace(/^```json\s*/i, '')
      ?.replace(/\s*```$/i, '') ?? '{}';
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error(
      'OpenAI did not return valid JSON. Raw: ' + raw.slice(0, 200),
    );
  }
}

async function main(): Promise<void> {
  const { language, level, title, description, studentNative, publish } =
    parseArgs();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is required. Set it in .env');
    process.exit(1);
  }

  console.log('Generating lesson content with OpenAI...');
  const content = await generateContent(
    apiKey,
    language,
    studentNative,
    level,
    title,
    description,
  );

  const { and, eq, sql } = await import('drizzle-orm');
  const { db } = await import('@/infrastructure/db/client');
  const { nativeLessons } = await import(
    '@/infrastructure/db/schema/native-lessons'
  );

  const maxOrderResult = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${nativeLessons.sortOrder}), 0)`,
    })
    .from(nativeLessons)
    .where(
      and(eq(nativeLessons.language, language), eq(nativeLessons.level, level)),
    );
  const sortOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1;

  const [inserted] = await db
    .insert(nativeLessons)
    .values({
      language,
      level,
      title,
      description,
      sortOrder,
      content: content as Record<string, unknown>,
      isPublished: publish,
    })
    .returning();

  if (!inserted) {
    throw new Error('Failed to insert lesson');
  }

  const sections = (content as { sections?: unknown[] })?.sections ?? [];
  const exercises = (content as { exercises?: unknown[] })?.exercises ?? [];
  console.log('\n--- Generated ---');
  console.log('Lesson ID:', inserted.id);
  console.log('Language:', language, '| Level:', level);
  console.log('Title:', title);
  console.log('Sections:', sections.length);
  console.log('Exercises:', exercises.length);
  console.log('Published:', publish);
  console.log('Sort order:', sortOrder);
}

main().catch((err: unknown) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  const errObj = err instanceof Error ? err : null;
  if (errObj?.stack) {
    console.error(errObj.stack);
  }
  process.exit(1);
});
