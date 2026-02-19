# PASS 1: LESSON — Core Content Generation

> **Platform feature:** Lições Nativas (Native Lessons)  
> **Inherits:** `00-BASE-SYSTEM.md`  
> **Requires:** `01-LEVEL-PARAMS.md` (for the target CEFR level)

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
- Must be **phrases/expressions**, not single words
- Must include the connected speech form as the PRIMARY form
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
- NO grammar terminology anywhere the learner can see
- Explain patterns through CONTRAST: "Natives say X, not Y"
- The "why" should be about communication intent, not grammar rules

---

### 3. CORE DIALOGUE

```json
{
  "dialogue_id": "dlg_001",
  "setting": "Physical/social context",
  "relationship": "How the speakers know each other",
  "emotional_tone": "Overall emotional context",
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

Generate `{variationCount}` variations of the core situation:

```json
{
  "variation_id": "var_001",
  "title": "Brief descriptive title",
  "change_axis": "register | relationship | emotion | cultural | complication",
  "description": "What's different about this scenario",
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

Generate 8-12 specific errors:

```json
{
  "mistakes": [
    {
      "id": "err_001",
      "category": "pronunciation | word_choice | word_order | false_friend | cultural | register",
      "wrong_version": "What {nativeLanguage} speakers typically say",
      "why_wrong": "Why it's wrong or unnatural (without grammar jargon)",
      "native_version": "What natives actually say",
      "memory_hook": "A memorable way to remember the correct form",
      "severity": "confusing | awkward | funny | offensive"
    }
  ]
}
```

**Rules:**
- Errors must be SPECIFIC to the `{nativeLanguage}` → `{targetLanguage}` pair
- Include at least 2 pronunciation errors, 2 word choice errors, 2 structural errors
- The "severity" field helps learners prioritize what to fix first

---

### 7. SECTIONS (for app theory blocks)

The app renders CONCEPT sections before exercises. Generate a "sections" array so the learner sees the theory:

```json
{
  "sections": [
    {
      "type": "CONCEPT",
      "icon": "🧠",
      "title": "Section title (e.g. from chunks or grammar theme)",
      "content": {
        "intro": { "title": "...", "text": "..." },
        "examples": [
          {
            "native": "What natives actually say",
            "translation": "Translation in {nativeLanguage}",
            "context": "When/how this is used",
            "never_say": "The textbook version to avoid (optional)"
          }
        ],
        "cultural_note": "Optional cultural insight"
      }
    }
  ]
}
```

Derive sections from your HIGH-FREQUENCY CHUNKS and INVISIBLE GRAMMAR PATTERNS (e.g. one section per major theme). Include at least 2–4 CONCEPT sections.

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
- Generate exactly 10 exercises. Mix: at least 2 SITUATION, 2 CHOICE, and a mix of REORDER, MATCH, TRANSFORM.
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
    // All sections 1–11 (chunks, grammar_patterns, dialogue, variations, module_speech_map, mistakes, sections, exercises, cognitive_reinforcement, cultural_notes, adaptive_metadata)
  }
}
```

---

## CRITICAL — VALIDATION (response will be rejected otherwise)

Your JSON **must** satisfy all of the following or the response will be rejected and the run will fail:

1. **content.chunks** — Array with **at least {chunkMin} and at most {chunkMax}** chunk objects. Use the key name `chunks` (not high_frequency_chunks). Fewer than {chunkMin} chunks = automatic rejection.
2. **content.module_speech_map.reductions** — Non-empty array of reduction objects (formal, spoken, audio_guide). At least 3–5 reductions for this module.
3. **content.adaptive_metadata** — Object with at least: difficulty_band, prerequisite_modules, escalation_path, simplification_path.

Generate the full set of {chunkMin}–{chunkMax} chunks in section 1; do not truncate or summarize.
