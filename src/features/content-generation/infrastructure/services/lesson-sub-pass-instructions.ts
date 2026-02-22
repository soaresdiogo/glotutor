import { MIN_SECTIONS_BY_LEVEL } from '../utils/content-validator';

export type LessonSubPassOptions = {
  targetLanguage?: string;
  nativeLanguage?: string;
};

/**
 * Shared instruction text for lesson generation (Part A, Part B1, Part B2).
 * Part A: chunks, grammar, dialogue, variations, speech_map, mistakes.
 * Part B1: sections, cognitive_reinforcement, cultural_notes, adaptive_metadata (no exercises).
 * Part B2: exercises only — dedicated sub-pass to hit minimum count reliably.
 * Used by both OpenAI and Gemini adapters.
 * When nativeEqualsTarget (options.nativeLanguage === options.targetLanguage), wording asks for target-language explanations instead of L1 translations.
 */

export const LESSON_SUB_PASS_A_INSTRUCTION = `
You are generating PART 1 of a lesson module. Generate ONLY these sections:

1. "chunks" — the full array of high-frequency chunks (minimum count as specified)
2. "grammar_patterns" — invisible grammar patterns (pattern_label is internal only; never use grammar terms in learner-visible text)
3. "dialogue" — core dialogue with clean_version and native_speed_version
4. "variations" — situational variations
5. "module_speech_map" — connected speech map with reductions, linking_patterns, weak_forms, stress_patterns
6. "mistakes" — common L1 speaker mistakes (8-12 errors)

NEVER use grammar terminology anywhere a learner can see: not "present perfect", "past simple", "conditional", "subjunctive", "gerund", "infinitive", "conjugation", or "declension". Use plain language and context instead.

Return a JSON object: { "chunks": [...], "grammar_patterns": [...], "dialogue": {...}, "variations": [...], "module_speech_map": {...}, "mistakes": [...] }

Do NOT generate sections, exercises, cognitive_reinforcement, cultural_notes, or adaptive_metadata yet — those come in Part 2.
`;

export const EXERCISE_COUNT_BY_LEVEL: Record<string, number> = {
  A1: 10,
  A2: 10,
  B1: 10,
  B2: 10,
  C1: 10,
  C2: 10,
};

export function buildLessonSubPassB1Instruction(
  partA: Record<string, unknown>,
  cefrLevel?: string,
  options?: LessonSubPassOptions,
): string {
  const chunkCount = (partA.chunks as unknown[])?.length ?? 15;
  const chunksPreview = JSON.stringify(
    (
      partA.chunks as Array<{ id: string; chunk: string; context?: string }>
    )?.map((c) => ({ id: c.id, chunk: c.chunk, context: c.context })) ?? [],
  );
  const grammarPreview = JSON.stringify(
    (partA.grammar_patterns as Array<{ pattern_label?: string }>)?.map(
      (p) => p.pattern_label,
    ) ?? [],
  );
  const levelKey = cefrLevel?.toUpperCase() ?? 'A1';
  const minSectionsForLevel = MIN_SECTIONS_BY_LEVEL[levelKey] ?? 8;
  const targetSections = Math.min(
    18,
    Math.max(minSectionsForLevel, Math.ceil(chunkCount / 2)),
  );
  const nativeEqualsTarget =
    options?.targetLanguage != null &&
    options?.nativeLanguage != null &&
    options.targetLanguage === options.nativeLanguage;
  const translationInstruction = nativeEqualsTarget
    ? '"translation": short paraphrase or explanation in the TARGET language (same language as the chunk — for immersion; no L1 translation)'
    : '"translation": natural translation in the student\'s native language';

  return `
You are generating PART 2A of a lesson module (sections and supporting content only — NO exercises yet). Part 1 already generated these chunks and grammar patterns:

CHUNKS (${chunkCount} total): ${chunksPreview}

GRAMMAR PATTERNS (labels): ${grammarPreview}

Now generate ONLY these sections (do NOT generate "exercises" — that is a separate step):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: "sections" — CONCEPT teaching blocks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are the TEACHING sections the student reads BEFORE doing exercises. They are the core learning content.

MANDATORY REQUIREMENTS:
- Generate EXACTLY ${targetSections} CONCEPT sections.
- NEVER use grammar terminology in titles, intros, or examples: no "present perfect", "past simple", "conditional", "subjunctive", "gerund", "infinitive", "conjugation", "declension" — grammar must be invisible.
- Group chunks by theme (e.g., "Ordering", "Paying", "Native Shortcuts", "Small Talk", "Leaving", etc.).
- Each section MUST have 2-3 chunk examples with all fields filled.
- EVERY chunk from Part 1 MUST appear as an example in at least one section. No chunk left behind.
- Each example MUST include ALL of these fields:
  * "native": the chunk phrase (exactly as written in Part 1)
  * ${translationInstruction}
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
        "translation": "${nativeEqualsTarget ? 'Short explanation in target language (e.g. Casual way to order a drink.)' : 'Posso pegar um café?'}",
        "context": "The most common way to order anything at a café.",
        "never_say": "May I have a coffee?"
      }
    ],
    "cultural_note": "In the US, 'Can I get...' is used 10x more than 'May I have...' in casual settings."
  }
}

✅ GOOD — DO THIS:
- ${targetSections} sections, each with 2-3 examples
- All ${chunkCount} chunks covered across sections
- Every example has native + translation + context + never_say

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTIONS 9-11: Supporting content (no exercises)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. "cognitive_reinforcement" — memory hooks (one per key chunk, at least 5), identity_shift (before/after states), micro_review_drills (at least 3), interleaving_suggestions.

10. "cultural_notes" — cultural insights (if level >= A2, generate 2-3 notes; for A1 return empty array).

11. "adaptive_metadata" — difficulty_band, prerequisite_modules, escalation_path, simplification_path, pronunciation_drill_injection.

Return a JSON object (do NOT include "exercises"):
{
  "sections": [...],
  "cognitive_reinforcement": {...},
  "cultural_notes": [...],
  "adaptive_metadata": {...}
}

VALIDATION — your response will be REJECTED if:
- Fewer than ${targetSections} CONCEPT sections (minimum for this level; output exactly ${targetSections}, no fewer)
- Any section has fewer than 2 examples
- Not all ${chunkCount} chunks appear in at least one section example
- Any grammar terminology appears in titles, intros, or examples (forbidden: "present perfect", "past simple", "conditional", "subjunctive", "gerund", "infinitive", "conjugation", "declension")
`;
}

export function buildLessonSubPassB2Instruction(
  partA: Record<string, unknown>,
  partB1: Record<string, unknown>,
  cefrLevel?: string,
  options?: LessonSubPassOptions,
): string {
  const chunkCount = (partA.chunks as unknown[])?.length ?? 15;
  const levelKey = (cefrLevel ?? 'A1').toUpperCase();
  const targetExercises =
    EXERCISE_COUNT_BY_LEVEL[levelKey] ?? EXERCISE_COUNT_BY_LEVEL.A1 ?? 10;
  const sectionsPreview = JSON.stringify(
    (partB1.sections as Array<{ title?: string }>)?.map((s) => s.title) ?? [],
  );
  const nativeEqualsTarget =
    options?.targetLanguage != null &&
    options?.nativeLanguage != null &&
    options.targetLanguage === options.nativeLanguage;
  const nativeFieldsNote = nativeEqualsTarget
    ? 'For A1/A2: every exercise MUST include "prompt_native" and "scenario_native" — write them in the TARGET language (same as prompt/scenario, or a simpler version). Immersion mode: no L1.'
    : 'For A1/A2: every exercise MUST include "prompt_native" and "scenario_native" fields (in the student\'s native language).';

  return `
You are generating PART 2B of a lesson module: ONLY the exercises array. The lesson already has chunks, sections, and supporting content. Your ONLY job is to output exactly ${targetExercises} exercises.

CONTEXT — Section themes from the lesson: ${sectionsPreview}
Chunk count: ${chunkCount}. Every exercise must test content from the lesson chunks/sections.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL: EXERCISE COUNT (non-negotiable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST return exactly ${targetExercises} exercises. This is a hard minimum for level ${levelKey}.
- Before returning your JSON, count the length of the "exercises" array.
- If it is less than ${targetExercises}, add more exercises until you have at least ${targetExercises}.
- 11 when ${targetExercises} is required = FAIL. Your response will be REJECTED and tokens wasted if you return fewer than ${targetExercises}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exercise mix requirements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- At least 3 SITUATION exercises (open-ended response to a scenario)
- At least 3 CHOICE exercises (multiple choice, 4 options, 1 correct)
- At least 2 REORDER exercises (put words in correct order)
- At least 2 MATCH exercises (match situations with phrases, 4-6 pairs each)
- Remaining can be TRANSFORM exercises (rewrite formal → casual)

Rules:
- SITUATION: acceptable_patterns must include 8-10+ short variations (1-3 words each).
- CHOICE: exactly 4 options, exactly 1 correct. Wrong options must be plausible.
- MATCH: 4-6 pairs per exercise.
- REORDER: the answer must be a natural-sounding native phrase from the chunks.
- TRANSFORM: include at least 5-6 acceptable_patterns per pair.
- ${nativeFieldsNote}

Return a JSON object with ONE key only:
{
  "exercises": [ ... ]
}

The "exercises" array MUST have length >= ${targetExercises}. Count before returning.
`;
}
