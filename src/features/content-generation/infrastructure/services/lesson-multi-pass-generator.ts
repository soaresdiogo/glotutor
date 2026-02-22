import OpenAI from 'openai';
import type { ComposedPrompt } from '@/features/content-generation/domain/types/generation-request.types';
import {
  buildLessonSubPassB1Instruction,
  buildLessonSubPassB2Instruction,
  LESSON_SUB_PASS_A_INSTRUCTION,
  type LessonSubPassOptions,
} from './lesson-sub-pass-instructions';

export type { LessonSubPassOptions } from './lesson-sub-pass-instructions';

/**
 * Splits lesson generation into sub-passes to avoid token truncation and hit exercise minimums.
 *
 * Sub-pass A: chunks, grammar_patterns, dialogue, variations, speech_map, mistakes
 * Sub-pass B1: sections (CONCEPT), cognitive_reinforcement, cultural_notes, adaptive_metadata (no exercises)
 * Sub-pass B2: exercises only — single focused call to hit minimum count reliably
 *
 * Higher max_tokens on B1/B2 to avoid truncation (D).
 */

const DEFAULT_MODEL = 'gpt-4o';
/** Cap at 16384 — gpt-4o-mini and some models support at most 16384 completion tokens. */
const MAX_TOKENS_PART_A = 16384;
const MAX_TOKENS_PART_B1_B2 = 16384;

export async function generateLessonInSubPasses(
  apiKey: string,
  composed: ComposedPrompt,
  cefrLevel?: string,
  model?: string,
  subPassOptions?: LessonSubPassOptions,
): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const resolvedModel =
    model ?? process.env.CONTENT_GENERATION_MODEL ?? DEFAULT_MODEL;

  const completionA = await openai.chat.completions.create({
    model: resolvedModel,
    messages: [
      { role: 'system', content: composed.systemPrompt },
      {
        role: 'user',
        content: `${composed.userMessage}\n\n${LESSON_SUB_PASS_A_INSTRUCTION}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: MAX_TOKENS_PART_A,
    temperature: 0.7,
  });

  if (process.env.LOG_TOKEN_USAGE === '1' && completionA.usage) {
    const u = completionA.usage;
    console.log(
      `[tokens] lesson-part-a: prompt=${u.prompt_tokens} completion=${u.completion_tokens} total=${u.total_tokens}`,
    );
  }

  const rawA = completionA.choices[0]?.message?.content;
  if (!rawA) throw new Error('Empty LLM response for lesson sub-pass A');

  let partA: Record<string, unknown>;
  try {
    partA = JSON.parse(rawA) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JSON from LLM for lesson sub-pass A');
  }

  const subPassB1Instruction = buildLessonSubPassB1Instruction(
    partA,
    cefrLevel,
    subPassOptions,
  );

  const completionB1 = await openai.chat.completions.create({
    model: resolvedModel,
    messages: [
      { role: 'system', content: composed.systemPrompt },
      {
        role: 'user',
        content: `${composed.userMessage}\n\n${subPassB1Instruction}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: MAX_TOKENS_PART_B1_B2,
    temperature: 0.7,
  });

  if (process.env.LOG_TOKEN_USAGE === '1' && completionB1.usage) {
    const u = completionB1.usage;
    console.log(
      `[tokens] lesson-part-b1: prompt=${u.prompt_tokens} completion=${u.completion_tokens} total=${u.total_tokens}`,
    );
  }

  const rawB1 = completionB1.choices[0]?.message?.content;
  if (!rawB1) throw new Error('Empty LLM response for lesson sub-pass B1');

  let partB1: Record<string, unknown>;
  try {
    partB1 = JSON.parse(rawB1) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JSON from LLM for lesson sub-pass B1');
  }

  const subPassB2Instruction = buildLessonSubPassB2Instruction(
    partA,
    partB1,
    cefrLevel,
    subPassOptions,
  );

  const completionB2 = await openai.chat.completions.create({
    model: resolvedModel,
    messages: [
      { role: 'system', content: composed.systemPrompt },
      {
        role: 'user',
        content: `${composed.userMessage}\n\n${subPassB2Instruction}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: MAX_TOKENS_PART_B1_B2,
    temperature: 0.7,
  });

  if (process.env.LOG_TOKEN_USAGE === '1' && completionB2.usage) {
    const u = completionB2.usage;
    console.log(
      `[tokens] lesson-part-b2: prompt=${u.prompt_tokens} completion=${u.completion_tokens} total=${u.total_tokens}`,
    );
  }

  const rawB2 = completionB2.choices[0]?.message?.content;
  if (!rawB2) throw new Error('Empty LLM response for lesson sub-pass B2');

  let partB2: Record<string, unknown>;
  try {
    partB2 = JSON.parse(rawB2) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JSON from LLM for lesson sub-pass B2');
  }

  // --- MERGE: A + B1 + B2 (B2 provides exercises only) ---
  const merged = {
    module_type: 'lesson',
    content: {
      ...partA,
      ...partB1,
      ...partB2,
    },
  };

  return JSON.stringify(merged);
}
