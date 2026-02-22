# PASS 1: LESSON — Core Content Generation

> **Platform feature:** Lições Nativas (Native Lessons)  
> **Inherits:** `00-BASE-SYSTEM.md`  
> **Requires:** `01-LEVEL-PARAMS.md` (for the target CEFR level)

---

## ⚠️ CRITICAL REQUIREMENTS (READ FIRST — MANDATORY)

These are **non-negotiable**. Failing to meet ANY of these = FAILED validation. Generating less than the minimum is NOT acceptable.

1. **Chunk count:** Generate at least **{chunkMin}** chunks (see LEVEL CONFIGURATION for range). Fewer = FAIL.
2. **CONCEPT sections:** Generate at least **{minSections}** sections with `"type": "CONCEPT"` for level **{cefrLevel}**. Fewer = FAIL.
3. **Exercises:** Generate **at least {minExercises} exercises** for level **{cefrLevel}**. This is a hard minimum (e.g. 9 when 10 is required = FAIL). Before returning your JSON, count the length of the `exercises` array; if it is less than {minExercises}, add more exercises until you have at least {minExercises}. (All levels: {minExercises}.)
4. **Connected speech map:** Must include reductions/linking/weak forms. Missing = FAIL.
5. **L1-specific mistakes:** Every entry in `mistakes` must be specific to **{nativeLanguage}** → **{targetLanguage}**. In each mistake, the field `why_wrong` MUST mention the learner's L1 (e.g. "Speakers of {nativeLanguage} often…" or "In {nativeLanguage} we…"). Generic explanations without L1 reference are not acceptable.
6. **Every section with CONCEPT must have at least 2 examples** in `content.examples`. Fewer = warning/fail.

The same rules apply to every target language (English, Spanish, French, etc.). There is no negotiation: hit the minimums.

---

## MODULE INPUT

```json
{
  "moduleId": "{moduleId}",
  "title": "{title}",
  "cefrLevel": "{cefrLevel}",
  "targetLanguage": "{targetLanguage}",
  "nativeLanguage": "{nativeLanguage}",
  "situationalTheme": "{situationalTheme}",
  "coreModuleNumber": "{coreModuleNumber}",
  "specificInstructions": "{specificInstructions}"
}
```

---

## LANGUAGE RULE (CRITICAL)

**All text that the learner sees in the app must be in {targetLanguage}**, except:
- Fields explicitly marked "in {nativeLanguage}" or "translation" (e.g. `translation`, `prompt_native`, `scenario_native`, `explanation` when it explains in L1).

So the following MUST be written in **{targetLanguage}** (e.g. Spanish, French — not English):
- **lesson_title**, **lesson_description**
- **sections[].title** (e.g. "Ordering Essentials" → "Lo esencial para pedir")
- **sections[].content.intro.title** and **sections[].content.intro.text**
- **sections[].content.examples[].native**, **context**, **never_say** (the phrase in target language; explanation can be in nativeLanguage if needed)
- **dialogue.setting**, **dialogue.emotional_tone** if shown to the learner
- **variations[].title**, **variations[].description**
- Any **prompt**, **scenario**, **feedback_***, **hint** that is not the _native version

Do NOT default to English. If the target language is Spanish, every learner-visible string must be in Spanish.

---

## GENERATION INSTRUCTIONS

Generate a complete lesson module with ALL of the following sections:

### 1. HIGH-FREQUENCY CHUNKS

Generate `{chunkCount}` chunks. For each:

```json
{
  "id": "chunk_001",
  "chunk": "How natives say it (with reductions/contractions)",
  "textbook_version": "How textbooks teach it",
  "translation": "Natural translation in {nativeLanguage}",
  "context": "When/why a native would say this (1 sentence)",
  "register": "casual | neutral | formal",
  "frequency": "daily | common | situational",
  "connected_speech_features": ["reduction:gonna", "linking:grab_a"],
  "mini_dialogue": [
    {"speaker": "A", "line": "...", "tone": "casual"},
    {"speaker": "B", "line": "...", "tone": "casual"}
  ]
}
```

**Rules for chunks:**
- Must be **phrases/expressions**, not single words, natural in **{targetLanguage}**
- For languages with cases (e.g. German), include case-marked forms where appropriate
- For languages with formal/informal "you" (e.g. Spanish tú/usted, French tu/vous), specify register in chunk metadata
- Must include the connected speech form as the PRIMARY form (use reductions/patterns that exist in the target language, e.g. liaison in French, not only English-style "gonna")
- Prioritize multi-word units that natives use as single "blocks"
- Each chunk should be usable in at least 3 different real-life situations
- Order chunks from most essential to least essential for the situation

---

### 2. INVISIBLE GRAMMAR PATTERNS

For each grammar pattern specified in the level config:

```json
{
  "pattern_id": "pat_001",
  "pattern_label": "Internal label only — NEVER shown to learner",
  "native_examples": [
    {
      "sentence": "Natural example using this pattern",
      "context": "Situation where you'd hear this",
      "connected_speech": "How it actually sounds when spoken fast"
    }
  ],
  "native_insight": "WHY natives choose this pattern (not WHAT the rule is)",
  "l1_interference": {
    "what_learners_say": "The wrong version {nativeLanguage} speakers produce",
    "why_its_wrong": "Why it sounds unnatural (not a grammar explanation)",
    "native_version": "What to say instead",
    "memory_hook": "A mental trick to remember the native version"
  }
}
```

**Rules:**
- NO grammar terminology anywhere the learner can see. Never use these words in any section title, intro, example, explanation, or mistake text: "present perfect", "past simple", "conditional", "subjunctive", "gerund", "infinitive", "conjugation", "declension".
- Explain patterns through CONTRAST: "Natives say X, not Y"
- The "why" should be about communication intent, not grammar rules

---

### 3. CORE DIALOGUE

**setting**, **emotional_tone** (and any label the learner might see) must be in **{targetLanguage}**.

```json
{
  "dialogue_id": "dlg_001",
  "setting": "Physical/social context (IN {targetLanguage})",
  "relationship": "How the speakers know each other",
  "emotional_tone": "Overall emotional context (IN {targetLanguage})",
  "speakers": [
    {"id": "A", "name": "Name", "personality": "Brief note"}
  ],
  
  "clean_version": [
    {
      "speaker": "A",
      "line": "The line with standard spelling",
      "tone": "emotional/tonal direction",
      "translation": "Natural {nativeLanguage} translation"
    }
  ],
  
  "native_speed_version": [
    {
      "speaker": "A",
      "line": "Same line with reductions written out (e.g., 'gonna', 'kinda')",
      "speech_annotations": {
        "reductions": ["going to → gonna"],
        "linking": ["grab_a → grabba"],
        "weak_forms": ["for → fer"],
        "stress": ["COFfee, not cofFEE"],
        "intonation": "rising/falling/flat + what it signals"
      }
    }
  ]
}
```

**Rules:**
- Include natural hesitations (um, uh, well, like) appropriate to level
- Include self-corrections at B1+ ("I went to the— actually I stopped by...")
- Stage directions for emotion are REQUIRED (they inform TTS and learner understanding)
- Both versions must tell the same story but the native version shows how it actually sounds

---

### 4. SITUATIONAL VARIATIONS

Generate `{variationCount}` variations of the core situation. **title** and **description** must be in **{targetLanguage}**.

```json
{
  "variation_id": "var_001",
  "title": "Brief descriptive title (IN {targetLanguage})",
  "change_axis": "register | relationship | emotion | cultural | complication",
  "description": "What's different about this scenario (IN {targetLanguage})",
  "key_chunks_that_change": ["chunk_id → new version for this context"],
  "mini_dialogue": [
    {"speaker": "A", "line": "...", "tone": "..."}
  ],
  "learning_point": "What this variation teaches about real communication"
}
```

**Rules:**
- Each variation must change something MEANINGFUL (not just swap names)
- At least one variation should introduce a complication or unexpected turn
- Variations should show how the SAME intent is expressed differently based on context

---

### 5. CONNECTED SPEECH MAP

```json
{
  "module_speech_map": {
    "reductions": [
      {"formal": "going to", "spoken": "gonna", "audio_guide": "Say 'GUH-nuh', not 'go-na'", "frequency_in_module": 5}
    ],
    "linking_patterns": [
      {"words": "pick it up", "linked": "pickit-up", "audio_guide": "The 'k' and 'i' blend together"}
    ],
    "weak_forms": [
      {"word": "to", "strong": "/tuː/", "weak": "/tə/", "when_weak": "Almost always in connected speech"}
    ],
    "stress_patterns": [
      {"phrase": "I don't THINK so", "stress_on": "THINK", "meaning_change": "Emphasizes doubt"}
    ],
    "intonation_contours": [
      {"type": "request_vs_demand", "example": "Can I get a coffee?↗ vs Can I get a coffee.↘"}
    ]
  }
}
```

---

### 6. COMMON {nativeLanguage} SPEAKER MISTAKES

Generate 8-12 specific errors. **Each mistake must be L1-specific:** in `why_wrong` you MUST reference **{nativeLanguage}** or "speakers of {nativeLanguage}" so the explanation is clearly for this language pair, not generic.

```json
{
  "mistakes": [
    {
      "id": "err_001",
      "category": "pronunciation | word_choice | word_order | false_friend | cultural | register",
      "wrong_version": "What {nativeLanguage} speakers typically say",
      "why_wrong": "Why it's wrong or unnatural — must mention {nativeLanguage} or 'speakers of {nativeLanguage}' (e.g. 'Speakers of Portuguese often…', 'In Spanish we…')",
      "native_version": "What natives actually say",
      "memory_hook": "A memorable way to remember the correct form",
      "severity": "confusing | awkward | funny | offensive"
    }
  ]
}
```

**Rules:**
- Errors must be SPECIFIC to the `{nativeLanguage}` → `{targetLanguage}` pair (e.g. ser/estar for Spanish, case errors for German, tense choice for French, false friends for the given pair)
- Include at least 2 pronunciation errors, 2 word choice errors, 2 structural errors typical for this language pair
- The "severity" field helps learners prioritize what to fix first

---

### 7. SECTIONS (for app theory blocks)

The app renders CONCEPT sections before exercises. Generate a "sections" array so the learner sees the theory. **Section titles and intro text MUST be in {targetLanguage}** (see LANGUAGE RULE above).

```json
{
  "sections": [
    {
      "type": "CONCEPT",
      "icon": "🧠",
      "title": "Section title IN {targetLanguage} (e.g. from chunks or grammar theme)",
      "content": {
        "intro": { "title": "Short intro title IN {targetLanguage}", "text": "Intro paragraph IN {targetLanguage}" },
        "examples": [
          {
            "native": "What natives actually say (IN {targetLanguage})",
            "translation": "Translation in {nativeLanguage}",
            "context": "When/how this is used (IN {targetLanguage})",
            "never_say": "The textbook version to avoid (IN {targetLanguage}, optional)"
          }
        ],
        "cultural_note": "Optional cultural insight (IN {targetLanguage})"
      }
    }
  ]
}
```

Derive sections from your HIGH-FREQUENCY CHUNKS and INVISIBLE GRAMMAR PATTERNS (e.g. one section per major theme). You MUST include at least **{minSections}** CONCEPT sections for level **{cefrLevel}**. Each CONCEPT section must have at least 2 examples in `content.examples`.

---

### 8. EXERCISES

Generate exercises in the EXACT format the app consumes. Use ONLY these types and fields:

**REORDER**
```json
{
  "type": "REORDER",
  "prompt": "Instruction in target language",
  "prompt_native": "Same instruction in {nativeLanguage} (required for A1/A2)",
  "scenario": "Optional short scenario",
  "scenario_native": "Scenario in {nativeLanguage} (required for A1/A2 if scenario present)",
  "words": ["word1", "word2", "word3"],
  "answer": "word1 word2 word3"
}
```

**SITUATION**
```json
{
  "type": "SITUATION",
  "prompt": "Instruction in target language",
  "prompt_native": "Same in {nativeLanguage} (required for A1/A2)",
  "scenario": "The situation description",
  "scenario_native": "Scenario in {nativeLanguage} (required for A1/A2)",
  "placeholder": "Placeholder for input",
  "hint": "Optional hint",
  "expected_answer": "One good example answer in target language",
  "acceptable_patterns": ["phrase1", "phrase2", "..."],
  "key_phrases": ["key phrase the student should use"],
  "feedback_correct": "Short feedback when answer is good",
  "feedback_needs_improvement": "Short feedback when answer needs work"
}
```
- acceptable_patterns must be GENEROUS (8–10+ variations per exercise). Include all natural ways a native could respond. Patterns should be SHORT (1–3 words) so they match partial answers.

**MATCH**
```json
{
  "type": "MATCH",
  "prompt": "Instruction in target language",
  "prompt_native": "Same in {nativeLanguage} (required for A1/A2)",
  "pairs": [
    { "situation": "Situation description", "chunk": "The matching chunk/phrase" }
  ]
}
```
- 4–6 pairs per exercise.

**CHOICE**
```json
{
  "type": "CHOICE",
  "prompt": "Instruction in target language",
  "prompt_native": "Same in {nativeLanguage} (required for A1/A2)",
  "scenario": "The scenario",
  "scenario_native": "Scenario in {nativeLanguage} (required for A1/A2)",
  "options": [
    { "text": "Option A", "correct": true, "explanation": "Why this is correct" },
    { "text": "Option B", "correct": false, "explanation": "Why not" },
    { "text": "Option C", "correct": false, "explanation": "Why not" },
    { "text": "Option D", "correct": false, "explanation": "Why not" }
  ]
}
```
- Exactly 4 options, exactly 1 correct.

**TRANSFORM**
```json
{
  "type": "TRANSFORM",
  "prompt": "Instruction in target language",
  "prompt_native": "Same in {nativeLanguage} (required for A1/A2)",
  "pairs": [
    {
      "textbook": "The formal/robotic version",
      "hint": "Hint for native version",
      "expected_answer": "Ideal native version",
      "acceptable_patterns": ["pattern1", "pattern2", "..."],
      "feedback_correct": "Good!",
      "feedback_needs_improvement": "Try to sound more natural."
    }
  ]
}
```
- acceptable_patterns per pair: 5–6+ variations. Any reasonable native version should match.

**Root structure**
```json
{
  "exercises": [
    // Mix of REORDER, SITUATION, MATCH, CHOICE, TRANSFORM (at least 2 SITUATION, 2 CHOICE, plus REORDER/MATCH/TRANSFORM)
  ]
}
```

**Exercise design rules:**
- Generate **at least {minExercises} exercises** for level **{cefrLevel}**. Fewer = validation FAIL and content is rejected. Before you finish: count the items in the `exercises` array; if count < {minExercises}, add more exercises (SITUATION, CHOICE, REORDER, MATCH, or TRANSFORM) until you have at least {minExercises}. Mix: at least 2 SITUATION, 2 CHOICE, and a mix of REORDER, MATCH, TRANSFORM.
- Every exercise must test content from the chunks/grammar in this module.
- All exercises must be contextual — set in real-world scenarios.
- For A1/A2: every exercise MUST include "prompt_native"; if the exercise has "scenario", it MUST include "scenario_native". Generate these in the same response.
- CHOICE: exactly 4 options, 1 correct. MATCH: 4–6 pairs. REORDER: words array and answer string.

---

### 9. COGNITIVE REINFORCEMENT (Memory & Identity Layer)

```json
{
  "cognitive_reinforcement": {
    "memory_hooks": [
      {
        "chunk_id": "chunk_001",
        "hook_type": "visual | auditory | emotional | situational",
        "hook": "A memorable association to lock this chunk in memory"
      }
    ],
    "identity_shift": {
      "before_state": "How the learner feels about this situation BEFORE the module",
      "after_state": "How they should feel AFTER completing it",
      "confidence_anchor": "The ONE phrase that, if they can say it naturally, proves they've leveled up",
      "social_proof_scenario": "A real-world moment where this skill matters"
    },
    "micro_review_drills": [
      {
        "type": "spaced_repetition_cue",
        "trigger": "24h after module completion",
        "prompt": "Quick recall prompt",
        "expected": "What the learner should produce"
      }
    ],
    "interleaving_suggestions": [
      "Module IDs that should be reviewed alongside this one for cross-pattern reinforcement"
    ]
  }
}
```

---

### 10. CULTURAL NOTES (if level >= A2)

```json
{
  "cultural_notes": [
    {
      "id": "cult_001",
      "insight": "A behavioral/linguistic insight (NOT a tourist tip)",
      "contrast_with_l1": "How this differs from {nativeLanguage} culture",
      "impact_on_communication": "What happens if you get this wrong",
      "example": "A concrete example showing this cultural difference in action"
    }
  ]
}
```

---

### 11. ADAPTIVE METADATA

```json
{
  "adaptive_metadata": {
    "difficulty_band": "low | mid | high",
    "prerequisite_modules": ["module_ids that should be completed first"],
    "escalation_path": {
      "if_score_above_threshold": "Generate harder variations with these parameters...",
      "additional_chunks": ["more advanced chunks to introduce"],
      "complexity_boost": "What changes in the next iteration"
    },
    "simplification_path": {
      "if_score_below_threshold": "Reduce to these core chunks...",
      "focus_chunks": ["the 5 most essential chunks to drill"],
      "support_additions": "What scaffolding to add"
    },
    "pronunciation_drill_injection": {
      "if_pronunciation_below_threshold": {
        "target_sounds": ["specific problem sounds for {nativeLanguage} speakers"],
        "drill_type": "minimal_pair | shadowing | isolation",
        "drill_content": ["specific drill items"]
      }
    }
  }
}
```

---

## OUTPUT

Return a single JSON object containing ALL sections above (1–11), wrapped in:

```json
{
  "module_type": "lesson",
  "module_id": "{moduleId}",
  "cefr_level": "{cefrLevel}",
  "target_language": "{targetLanguage}",
  "native_language": "{nativeLanguage}",
  "generated_at": "ISO timestamp",
  "content": {
    "lesson_title": "Short catchy title for this lesson IN {targetLanguage} (e.g. Coffee Shop Survival → Survie au café)",
    "lesson_description": "One-line description IN {targetLanguage} for the lesson (e.g. Ordering food & drinks — A cozy café)",
    // All sections 1–11 (chunks, grammar_patterns, dialogue, variations, module_speech_map, mistakes, sections, exercises, cognitive_reinforcement, cultural_notes, adaptive_metadata)
  }
}
```

**lesson_title** and **lesson_description** MUST be in **{targetLanguage}**. They are shown in the app; do not use English unless the target language is English.

---

## CRITICAL — VALIDATION (response will be rejected otherwise)

Your JSON **must** satisfy all of the following or the response will be rejected and the run will fail:

1. **content.chunks** — Array with **at least {chunkMin} and at most {chunkMax}** chunk objects. Use the key name `chunks` (not high_frequency_chunks). Fewer than {chunkMin} chunks = automatic rejection.
2. **content.sections** — At least **{minSections}** items with `"type": "CONCEPT"`. Fewer = rejection.
3. **content.exercises** — Array length **MUST be >= {minExercises}**. Count before returning. If you have {minExercises}-1 or fewer, add more exercises. No exceptions.
4. **content.module_speech_map.reductions** — Non-empty array of reduction objects (formal, spoken, audio_guide). At least 3–5 reductions for this module.
5. **content.adaptive_metadata** — Object with at least: difficulty_band, prerequisite_modules, escalation_path, simplification_path.
6. **LANGUAGE:** content.lesson_title, content.lesson_description, every content.sections[].title, and every content.sections[].content.intro (title + text) must be in **{targetLanguage}**. Reject or correct if any of these are in English when target language is not English.
7. **mistakes[].why_wrong** — Each must mention **{nativeLanguage}** or "speakers of {nativeLanguage}" so mistakes are L1-specific.

Generate the full set of {chunkMin}–{chunkMax} chunks in section 1; do not truncate or summarize.
