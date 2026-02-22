# PASS 3: PODCAST — Listening Content Generation

> **Platform feature:** Podcast Generation (AI-generated audio via TTS)  
> **Inherits:** `00-BASE-SYSTEM.md`  
> **Requires:** Output from Pass 1 (chunks) and Pass 2 (reading context)

---

## ⚠️ CRITICAL REQUIREMENTS (READ FIRST — MANDATORY)

These are **non-negotiable**. Failing to meet them = FAILED validation.

1. **Comprehension exercises:** Exactly **10** exercises in total (across pre_listening, while_listening, post_listening). Fewer = FAIL.
2. **Chunk integration:** At least **60%** of Pass 1 chunks must appear naturally in the script. Fewer = validation failure.
3. **Episode metadata + script:** Must be present; missing = FAIL.
4. **Duration/style:** Respect the level's `podcast_params` from LEVEL CONFIGURATION (duration target, speakers, speech rate).

Same rules for every target language. No negotiation.

---

## CONTEXT INJECTION FROM PREVIOUS PASSES

```json
{
  "moduleId": "{moduleId}",
  "title": "{title}",
  "cefrLevel": "{cefrLevel}",
  "targetLanguage": "{targetLanguage}",
  "nativeLanguage": "{nativeLanguage}",
  "situationalTheme": "{situationalTheme}",
  
  "from_pass_1": {
    "chunks_taught": ["chunk objects"],
    "grammar_patterns": ["patterns used"],
    "dialogue_theme": "summary of lesson dialogue"
  },
  "from_pass_2": {
    "reading_theme": "summary of reading content",
    "additional_vocabulary": ["new vocab introduced in reading"]
  },
  
  "podcast_params": {
    "format": "{level-specific format from LEVEL-PARAMS}",
    "duration_minutes": { "min": "{min}", "max": "{max}" },
    "speakers": "{speaker count}",
    "speech_rate": "{level-specific speech rate}",
    "styles": ["{available styles for this level}"]
  }
}
```

---

## GENERATION INSTRUCTIONS

### 1. EPISODE METADATA

```json
{
  "episode": {
    "id": "pod_{moduleId}",
    "title": "Catchy, authentic episode title",
    "description": "1-2 sentence description for the learner",
    "duration_target_minutes": "number",
    "style": "Which style from the level's available styles",
    "setting": "Where/when this conversation happens",
    
    "speakers": [
      {
        "id": "speaker_1",
        "name": "Realistic name for the target language culture",
        "role": "host | guest | friend_1 | friend_2 | colleague | stranger",
        "personality": "2-3 word personality descriptor (e.g., 'laid-back, funny')",
        "accent": "Locale/variant for TTS (e.g. en-US, en-GB, pt-BR, es-MX). Use one consistent variant per episode unless the scenario requires dialect contrast.",
        "speech_style": "How this person talks (fast, uses lots of fillers, very direct, etc.)",
        "tts_voice_suggestion": "male_young | female_young | male_mature | female_mature"
      }
    ]
  }
}
```

---

### 2. FULL SCRIPT

Write the complete podcast script. This will be converted to audio via TTS, so write for the EAR.

```json
{
  "script": {
    "sections": [
      {
        "section_id": "sec_001",
        "section_title": "Brief title for this section",
        "section_type": "intro | topic_setup | main_discussion | tangent | conclusion | transition",
        "duration_estimate_seconds": "number",
        "difficulty_rating": 1-5,
        "key_vocabulary": ["important words in this section"],
        
        "lines": [
          {
            "line_id": "line_001",
            "speaker": "speaker_1",
            "text": "The spoken line with natural speech features",
            "tone": "emotional/tonal direction (enthusiastic, skeptical, casual, etc.)",
            "speech_features": {
              "hesitations": ["um positions", "uh positions"],
              "self_corrections": ["I went— actually I stopped by..."],
              "fillers": ["like", "you know", "I mean"],
              "reactions": ["[laughs]", "[mm-hmm]", "[sighs]"],
              "emphasis": ["words that should be stressed"]
            },
            "contains_chunks": ["chunk_ids from Pass 1 that appear in this line"]
          }
        ]
      }
    ]
  }
}
```

**Script writing rules:**
- **Always use exactly two speakers** (speaker_1 and speaker_2). Alternate between them so the podcast is a real dialogue, not a monologue. Each section must have multiple lines from both speakers.
- **Write for TTS output.** Short sentences. Natural breath points. Clear speaker turns.
- **Minimum length:** aim for at least 2–3 minutes of audio (roughly 300–450 words total) so the episode feels substantial.
- **Include hesitations and fillers** appropriate to level and to **{targetLanguage}** (e.g. language-specific fillers, not only English "um", "like").
- **Self-corrections are content, not errors.** They teach real listening skills.
- **Reactions and laughter are REQUIRED.** A podcast without "[laughs]" or "[mm-hmm]" sounds robotic.
- **At least 60% of Pass 1 chunks must appear naturally** in the script.
- **Each section should be independently understandable** (for section-by-section playback in the app).
- **Connected speech and reductions** must be appropriate to the target language (e.g. French liaison and elision, German separable verb stress, Spanish reductions), not only English examples like "gonna".

---

### 3. CONNECTED SPEECH ANNOTATION

For key segments of the script, create an annotated version showing:

```json
{
  "connected_speech_version": {
    "annotated_segments": [
      {
        "line_id": "line_003",
        "original": "I'm going to grab a coffee before the meeting",
        "annotated": "I'm |gonna grab a| |coffee before the| |meeting|",
        "annotations": {
          "reductions": [
            {"original": "going to", "reduced": "gonna", "position": "word 3-4"}
          ],
          "linking": [
            {"words": "grab a", "linked_as": "grabba", "type": "consonant-vowel linking"}
          ],
          "weak_forms": [
            {"word": "the", "strong": "/ðiː/", "weak": "/ðə/", "reason": "before consonant"}
          ],
          "rhythm_groups": [
            "|gonna grab a| = one beat",
            "|coffee before the| = one beat"
          ],
          "disappearing_sounds": [
            {"word": "meeting", "feature": "final g is often dropped: meetin'"}
          ]
        }
      }
    ]
  }
}
```

**Annotate at least:**
- 30% of lines at A1-A2
- 20% of lines at B1-B2
- 15% of lines at C1-C2 (learners should be catching these on their own by now)

---

### 4. COMPREHENSION EXERCISES

```json
{
  "exercises": {
    "pre_listening": [
      {
        "id": "pre_001",
        "type": "prediction | vocabulary_preview | context_activation",
        "instruction": "Instruction in {nativeLanguage}",
        "content": "The exercise content",
        "purpose": "Primes the learner for what they'll hear"
      }
    ],
    
    "while_listening": [
      {
        "id": "while_001",
        "type": "gap_fill_audio | true_false | sequence_order | speaker_identification | chunk_catch",
        "instruction": "Instruction in {nativeLanguage}",
        "section_id": "Which script section this relates to",
        "timestamp_hint": "Approximate position in the audio",
        "content": {
          "question": "The question or prompt",
          "options": ["if applicable"],
          "correct_answer": "answer",
          "explanation": "Brief explanation in {nativeLanguage}"
        }
      }
    ],
    
    "post_listening": [
      {
        "id": "post_001",
        "type": "chunk_extraction | retelling | opinion_response | connected_speech_identification | summary",
        "instruction": "Instruction in {nativeLanguage}",
        "content": "The exercise content",
        "expected_output": "What a good response looks like",
        "scoring_criteria": "How to evaluate the learner's response"
      }
    ]
  }
}
```

**Exercise count:** Generate exactly **10 comprehension exercises** per episode (total across pre, while, and post).

**Exercise content rules (CRITICAL — the app shows question + options; without context, exercises are unusable):**

- **vocabulary_preview**: Use instruction like "Translate these words" in the learner's native language. For each exercise, set `content.question` to a clear prompt, e.g. "What is the translation of 'linha'?" or "Traduza: linha" (in native language). Set `content.options` to 3–4 possible translations (one correct). Set `content.correct_answer` to the correct translation. Do NOT use vague prompts like "Revise the vocabulary: word1, word2, word3" without a clear task.

- **gap_fill_audio / fill_blank** (and any "missing word" multiple choice): `content.question` MUST be the full sentence with a blank where the word goes, e.g. "I _____ a coffee every morning." or "She ___ to the market." The learner must see the sentence to choose the right word. Set `content.options` to the possible words (e.g. ["get", "take", "make"]). Do NOT use only "Fill in the missing word" or "What is the missing word?" as the question without the sentence.

- **multiple_choice**: Always provide enough context in `content.question` so the learner can answer without guessing. If the question is about a word in a sentence, include the sentence (with _____ for the missing word). If it is about a translation, state the word clearly.

- **connected_speech_identification**: Make the task concrete. Set `content.question` to something like "In the sentence 'I'm gonna get a coffee', which part is an example of connected speech or reduction?" and `content.options` to 2–4 phrase choices (e.g. ["I'm", "gonna get", "a coffee"]), with `content.correct_answer` being the phrase that contains the reduction (e.g. "gonna get"). Do NOT use vague instructions like "Marque onde a fala conectada aparece" without giving the sentence and clear choices.

**Exercise mix per level (total = 10):**

| Level | Pre-listening | While-listening | Post-listening |
|-------|--------------|-----------------|----------------|
| A1 | 2 (vocab preview + prediction) | 5 (gap fill, T/F, chunk catch) | 3 (chunk extraction, simple retelling) |
| A2 | 2 (context activation + prediction) | 5 (gap fill, sequence, speaker ID) | 3 (retelling, opinion, chunk extraction) |
| B1 | 1 (prediction) | 5 (T/F, sequence, inference) | 4 (summary, opinion, connected speech ID) |
| B2+ | 1 (prediction) | 4 (inference, speaker intent, detail) | 5 (analysis, opinion, connected speech, critical response) |

---

### 5. SPEED VERSIONS

Define parameters for generating multiple playback speeds:

```json
{
  "speed_versions": {
    "slow": {
      "rate": 0.75,
      "description": "Clear, separated speech. Good for first listen.",
      "modifications": "Add slight pauses between thought groups. Enunciate reductions more clearly."
    },
    "normal": {
      "rate": 1.0,
      "description": "Natural conversational speed.",
      "modifications": "Standard output. All reductions and connected speech active."
    },
    "native_fast": {
      "rate": 1.15,
      "description": "Slightly faster than normal — realistic for animated conversation.",
      "modifications": "Increase connected speech. Reduce pauses between turns. Add more overlap markers."
    }
  }
}
```

---

### 6. ADAPTIVE METADATA

```json
{
  "adaptive_metadata": {
    "difficulty_band": "low | mid | high",
    "chunk_coverage": "Percentage of Pass 1 chunks used",
    "connected_speech_density": "How many annotated features per minute",
    
    "escalation_path": {
      "if_comprehension_above_85": "Next podcast: increase speed, reduce pauses, add speaker overlap",
      "if_chunk_catch_above_90": "Next podcast: introduce chunks from next module"
    },
    "simplification_path": {
      "if_comprehension_below_50": "Regenerate with slower pace, fewer speakers, shorter sections",
      "if_chunk_catch_below_40": "Generate micro-episode focusing only on top 5 chunks"
    },
    "pronunciation_focus": {
      "if_connected_speech_recognition_low": "Generate targeted reduction discrimination drills"
    }
  }
}
```

---

## OUTPUT

Return a single JSON object:

```json
{
  "module_type": "podcast",
  "module_id": "{moduleId}",
  "cefr_level": "{cefrLevel}",
  "target_language": "{targetLanguage}",
  "native_language": "{nativeLanguage}",
  "generated_at": "ISO timestamp",
  "pass_1_reference": "{moduleId}-lesson",
  "pass_2_reference": "{moduleId}-reading",
  "content": {
    // All sections above
  }
}
```

---

## CRITICAL RULES

1. **This will be HEARD, not read.** Write for the ear. Short sentences. Natural rhythm. Clear speaker turns.
2. **Hesitations and fillers are FEATURES.** They teach real listening skills. Don't write sanitized dialogue.
3. **At least 60% chunk integration.** Chunks from Pass 1 must appear naturally in conversation.
4. **Sections must be independently playable.** Each section should make sense on its own (for section-by-section listening in the app).
5. **Connected speech annotations must be accurate.** Wrong phonetic information is worse than no information.
6. **The content must tell a story or have a point.** Not a lecture, not a list of examples — a real conversation that a learner wants to follow.
