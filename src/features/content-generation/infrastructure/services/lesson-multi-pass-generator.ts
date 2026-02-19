import OpenAI from 'openai';
import type { ComposedPrompt } from '@/features/content-generation/domain/types/generation-request.types';

/**
 * Splits lesson generation into sub-passes to avoid token truncation.
 *
 * Sub-pass A: chunks (15-20), grammar_patterns, dialogue, variations, speech_map, mistakes
 * Sub-pass B: sections (CONCEPT), exercises (10), cognitive_reinforcement, cultural_notes, adaptive_metadata
 *
 * Sub-pass B receives the output of Sub-pass A as context.
 */

const MODEL = 'gpt-4o';

export async function generateLessonInSubPasses(
  apiKey: string,
  composed: ComposedPrompt,
  cefrLevel?: string,
): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const model = process.env.CONTENT_GENERATION_MODEL ?? MODEL;

  // --- SUB-PASS A: Core content (chunks, grammar, dialogue, variations, speech_map, mistakes) ---
  const subPassAInstruction = `
You are generating PART 1 of a lesson module. Generate ONLY these sections:

1. "chunks" — the full array of high-frequency chunks (minimum count as specified)
2. "grammar_patterns" — invisible grammar patterns
3. "dialogue" — core dialogue with clean_version and native_speed_version
4. "variations" — situational variations
5. "module_speech_map" — connected speech map with reductions, linking_patterns, weak_forms, stress_patterns
6. "mistakes" — common L1 speaker mistakes (8-12 errors)

Return a JSON object: { "chunks": [...], "grammar_patterns": [...], "dialogue": {...}, "variations": [...], "module_speech_map": {...}, "mistakes": [...] }

Do NOT generate sections, exercises, cognitive_reinforcement, cultural_notes, or adaptive_metadata yet — those come in Part 2.
`;

  const completionA = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: composed.systemPrompt },
      {
        role: 'user',
        content: `${composed.userMessage}\n\n${subPassAInstruction}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 16384,
    temperature: 0.7,
  });

  const rawA = completionA.choices[0]?.message?.content;
  if (!rawA) throw new Error('Empty LLM response for lesson sub-pass A');

  let partA: Record<string, unknown>;
  try {
    partA = JSON.parse(rawA) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JSON from LLM for lesson sub-pass A');
  }

  // --- SUB-PASS B: Sections + exercises scaled by level ---
  const chunkCount = (partA.chunks as unknown[])?.length ?? 15;
  const chunksPreview = JSON.stringify(
    (
      partA.chunks as Array<{
        id: string;
        chunk: string;
        context?: string;
      }>
    )?.map((c) => ({
      id: c.id,
      chunk: c.chunk,
      context: c.context,
    })) ?? [],
  );
  const grammarPreview = JSON.stringify(
    (partA.grammar_patterns as Array<{ pattern_label?: string }>)?.map(
      (p) => p.pattern_label,
    ) ?? [],
  );

  const targetSections = Math.min(18, Math.max(8, Math.ceil(chunkCount / 2)));
  const exerciseCountByLevel: Record<string, number> = {
    A1: 10,
    A2: 12,
    B1: 14,
    B2: 16,
    C1: 16,
    C2: 18,
  };
  const levelKey = (cefrLevel ?? 'A1').toUpperCase();
  const targetExercises =
    exerciseCountByLevel[levelKey] ?? exerciseCountByLevel.A1 ?? 10;

  const subPassBInstruction = `
You are generating PART 2 of a lesson module. Part 1 already generated these chunks and grammar patterns:

CHUNKS (${chunkCount} total): ${chunksPreview}

GRAMMAR PATTERNS (labels): ${grammarPreview}

Now generate ONLY these remaining sections:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: "sections" — CONCEPT teaching blocks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are the TEACHING sections the student reads BEFORE doing exercises. They are the core learning content.

MANDATORY REQUIREMENTS:
- Generate EXACTLY ${targetSections} CONCEPT sections.
- Group chunks by theme (e.g., "Ordering", "Paying", "Native Shortcuts", "Small Talk", "Leaving", etc.).
- Each section MUST have 2-3 chunk examples with all fields filled.
- EVERY chunk from Part 1 MUST appear as an example in at least one section. No chunk left behind.
- Each example MUST include ALL of these fields:
  * "native": the chunk phrase (exactly as written in Part 1)
  * "translation": natural translation in the student's native language
  * "context": when/where this is used (1 sentence)
  * "never_say": the textbook/formal version to avoid (from the chunk's textbook_version)
- Include a "cultural_note" in at least half of the sections.
- Each section needs an "intro" with a short "title" and "text" (1-2 sentences explaining the theme).

FORMAT:
{
  "type": "CONCEPT",
  "icon": "🧠",
  "title": "Section Theme Title",
  "content": {
    "intro": {
      "title": "Short catchy title",
      "text": "Brief explanation of why this matters."
    },
    "examples": [
      {
        "native": "Can I get a coffee?",
        "translation": "Posso pegar um café?",
        "context": "The most common way to order anything at a café.",
        "never_say": "May I have a coffee?"
      },
      {
        "native": "I wanna try the cake.",
        "translation": "Eu quero experimentar o bolo.",
        "context": "When you want to taste something specific.",
        "never_say": "I would like to try the cake."
      }
    ],
    "cultural_note": "In the US, 'Can I get...' is used 10x more than 'May I have...' in casual settings."
  }
}

❌ BAD — DO NOT DO THIS:
- 2-3 sections with 1 example each (student learns almost nothing before exercises)
- Sections that skip chunks (student encounters unknown phrases in exercises)
- Generic cultural notes ("Americans are friendly" — too vague)
- Missing "never_say" field (student doesn't know what to avoid)

✅ GOOD — DO THIS:
- ${targetSections} sections, each with 2-3 examples
- All ${chunkCount} chunks covered across sections
- Specific cultural notes ("Americans say 'Can I get...' not 'May I have...' at coffee shops")
- Every example has native + translation + context + never_say

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8: "exercises" — Practice blocks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate exactly ${targetExercises} exercises.

Mix requirements:
- At least 3 SITUATION exercises (open-ended response to a scenario)
- At least 3 CHOICE exercises (multiple choice, 4 options, 1 correct)
- At least 2 REORDER exercises (put words in correct order)
- At least 2 MATCH exercises (match situations with phrases, 4-6 pairs each)
- Remaining can be TRANSFORM exercises (rewrite formal → casual)

Rules:
- Every exercise must test content from the chunks/sections above.
- SITUATION: acceptable_patterns must include 8-10+ short variations (1-3 words each).
- CHOICE: exactly 4 options, exactly 1 correct. Wrong options must be plausible.
- MATCH: 4-6 pairs per exercise.
- REORDER: the answer must be a natural-sounding native phrase from the chunks.
- TRANSFORM: include at least 5-6 acceptable_patterns per pair.
- For A1/A2: every exercise MUST include "prompt_native" and "scenario_native" fields.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTIONS 9-11: Supporting content
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. "cognitive_reinforcement" — memory hooks (one per key chunk, at least 5), identity_shift (before/after states), micro_review_drills (at least 3), interleaving_suggestions.

10. "cultural_notes" — cultural insights (if level >= A2, generate 2-3 notes; for A1 return empty array).

11. "adaptive_metadata" — difficulty_band, prerequisite_modules, escalation_path, simplification_path, pronunciation_drill_injection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return a JSON object:
{
  "sections": [...],
  "exercises": [...],
  "cognitive_reinforcement": {...},
  "cultural_notes": [...],
  "adaptive_metadata": {...}
}

VALIDATION — your response will be REJECTED if:
- Fewer than ${targetSections} CONCEPT sections
- Any section has fewer than 2 examples
- Not all ${chunkCount} chunks appear in at least one section example
- Fewer than ${targetExercises} exercises
- Exercise type mix doesn't meet the minimums above
`;

  const completionB = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: composed.systemPrompt },
      {
        role: 'user',
        content: `${composed.userMessage}\n\n${subPassBInstruction}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 16384,
    temperature: 0.7,
  });

  const rawB = completionB.choices[0]?.message?.content;
  if (!rawB) throw new Error('Empty LLM response for lesson sub-pass B');

  let partB: Record<string, unknown>;
  try {
    partB = JSON.parse(rawB) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid JSON from LLM for lesson sub-pass B');
  }

  // --- MERGE ---
  const merged = {
    module_type: 'lesson',
    content: {
      ...partA,
      ...partB,
    },
  };

  return JSON.stringify(merged);
}
