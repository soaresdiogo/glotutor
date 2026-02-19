# PASS 2: READING — Read Aloud Content Generation (REVISED v2)

> **Platform feature:** Reading Practice (Read Aloud)  
> **Inherits:** `00-BASE-SYSTEM.md`  
> **Requires:** Output from Pass 1 (lesson chunks, grammar patterns, dialogue themes)

---

## ⚠️ CRITICAL REQUIREMENTS (READ FIRST)

These are **MANDATORY** — failure to meet ANY of these = FAILED validation:

1. ✅ **EXACTLY 10 comprehension questions** — not 9, not 11, EXACTLY 10
2. ✅ **Minimum 60% chunk coverage** — You will receive N chunks from Pass 1. Use AT LEAST 60% of them (round up)
3. ✅ **Word count within CEFR range** — See table below, NO exceptions
4. ✅ **Narrative text format ONLY** — NO social media, NO chats, NO fragmented formats
5. ✅ **Natural paragraph structure** — Flowing prose with proper paragraph breaks

**EXAMPLE:** If Pass 1 provides 15 chunks, you MUST use at least 9 chunks (60% of 15 = 9).

---

## CONTEXT INJECTION FROM PASS 1

```json
{
  "moduleId": "{moduleId}",
  "title": "{title}",
  "cefrLevel": "{cefrLevel}",
  "targetLanguage": "{targetLanguage}",
  "nativeLanguage": "{nativeLanguage}",
  
  "from_pass_1": {
    "chunks_taught": [
      // IMPORTANT: You will receive a LIST of chunk objects
      // COUNT them and ensure you use ≥60% in your reading text
      {"id": "chunk_001", "phrase": "don't worry", ...},
      {"id": "chunk_002", "phrase": "take it easy", ...},
      // ... etc
    ],
    "total_chunks": 15,  // This tells you how many chunks you MUST cover
    "minimum_chunks_required": 9,  // 60% of total (this is your TARGET)
    "grammar_patterns_used": ["present continuous", "can for requests"],
    "dialogue_summary": "Brief summary of the core dialogue scenario"
  }
}
```

---

## GENERATION INSTRUCTIONS

### 1. READING TEXT — NARRATIVE FORMAT ONLY

**STEP 1: Count the chunks**
- You will receive `total_chunks` from Pass 1
- Calculate: `minimum_required = ceil(total_chunks * 0.6)`
- Track which chunks you use: `chunks_used: ["chunk_001", "chunk_005", ...]`

**STEP 2: Create narrative text that:**

- Is written as **flowing story, article, or blog post** (NOT social media/chats)
- Naturally incorporates **AT LEAST 60%** of chunks from Pass 1
- Uses the grammar patterns from lesson in natural context
- Tells a **NEW story/scenario** thematically connected to Pass 1
- Is **engaging and pleasant to read aloud**
- Follows the **word count guidelines** strictly (see table below)
- Uses **natural paragraph breaks** (3-6 paragraphs for most levels)

```json
{
  "reading_text": {
    "format": "narrative_text",
    "title": "Engaging title for the reading",
    "content": {
      "text": "Complete narrative with \\n\\n for paragraph breaks",
      "paragraphs": [
        "First paragraph introducing context...",
        "Second paragraph with chunks integrated...",
        "Third paragraph developing story...",
        "Final paragraph wrapping up..."
      ]
    },
    "word_count": 105,  // Must be within range for CEFR level
    "chunks_used": ["chunk_001", "chunk_003", "chunk_005", "chunk_007", "chunk_009", "chunk_011", "chunk_013", "chunk_014", "chunk_015"],
    "chunk_coverage_percentage": 60,  // 9/15 = 60%
    "chunk_coverage_validation": {
      "total_available": 15,
      "minimum_required": 9,
      "actually_used": 9,
      "meets_requirement": true
    }
  }
}
```

---

## WORD COUNT GUIDELINES BY CEFR LEVEL

**STRICT ENFORCEMENT** — These are hard limits:

| CEFR Level | Word Count Range | Typical Structure |
|------------|------------------|-------------------|
| **A1** | 80-120 words | 2-3 short paragraphs |
| **A2** | 120-180 words | 3-4 paragraphs |
| **B1** | 180-250 words | 4-5 paragraphs |
| **B2** | 250-350 words | 5-6 paragraphs |
| **C1** | 350-500 words | 6-8 paragraphs |
| **C2** | 500-700 words | 8-10 paragraphs |

⚠️ **CRITICAL:** A 300-word text for A1 learners = FAILED validation.

---

## APPROVED TEXT FORMATS

### ✅ APPROVED (use ONLY these):

1. **narrative_story** — Short story with beginning, middle, end
2. **personal_blog** — First-person narrative about an experience
3. **news_article** — Journalistic piece with headline, intro, body
4. **opinion_piece** — Essay presenting viewpoint
5. **travel_diary** — Narrative about visiting a place
6. **interview_transcript** — Q&A with narrative flow
7. **how_to_guide** — Instructional narrative
8. **biography_snippet** — Short biographical narrative
9. **cultural_essay** — Explanatory cultural text
10. **personal_essay** — Reflective first-person narrative

### ❌ FORBIDDEN (will FAIL validation):

- ❌ whatsapp_chat / text_message_thread
- ❌ instagram_caption / social_media_post
- ❌ email_thread / slack_conversation
- ❌ Any fragmented format

---

## 2. VOCABULARY HIGHLIGHTS

Select **8-15 vocabulary items** (scale with text length):

```json
{
  "vocabulary": [
    {
      "id": "vocab_001",
      "word": "the word or phrase",
      "position_in_text": 1,  // paragraph number (1-indexed)
      "is_chunk_from_lesson": true,
      "definition": "Simple definition in {targetLanguage}",
      "translation": "Natural translation in {nativeLanguage}",
      "pronunciation_note": "/aɪ.pi.ˈeɪ/ or guidance",
      "example_sentence": "Another example in context",
      "difficulty_level": "easy | medium | hard"
    }
  ]
}
```

---

## 3. COMPREHENSION QUESTIONS

### ⚠️ CRITICAL: EXACTLY 10 QUESTIONS

**This is NON-NEGOTIABLE. Generate EXACTLY 10 questions.**

```json
{
  "comprehension": [
    {
      "id": "q_001",
      "type": "multiple_choice | true_false | open_ended | inference | chunk_in_context",
      "question": "Question in {targetLanguage}",
      "question_translation": "Translation in {nativeLanguage}",
      "options": ["Option A", "Option B", "Option C", "Option D"],  // for multiple_choice
      "correct_answer": "The correct answer",
      "explanation": "Why correct and why others wrong (in {nativeLanguage})",
      "tests": "main_idea | detail | inference | vocabulary | chunk_usage",
      "difficulty": "easy | medium | hard"
    }
    // ... repeat until you have EXACTLY 10 questions
  ]
}
```

### Required Question Distribution:

**COUNT AS YOU GO** to ensure exactly 10:

- 2 questions: **main idea** ("What is this text mainly about?")
- 3 questions: **detail** ("According to text, what did X do?")
- 3 questions: **inference** ("Why did X probably...?")
- 2 questions: **chunk-in-context** ("What does 'gimme' mean here?")

**Total = 2 + 3 + 3 + 2 = 10 questions ✓**

### Difficulty Progression:

1-3: Easy (literal comprehension)
4-7: Medium (understanding + some inference)
8-10: Hard (inference, chunk application, evaluation)

---

## 4. PRONUNCIATION FOCUS POINTS

Generate **5-8 pronunciation focus points**:

```json
{
  "pronunciation_focus": [
    {
      "id": "pron_001",
      "word_or_phrase": "Word from text (exact match)",
      "position_in_text": 2,  // paragraph number
      "focus_type": "difficult_sound | connected_speech | stress_pattern | intonation | rhythm",
      "for_native_speakers_of": "{nativeLanguage}",
      "challenge": "WHY this is hard for {nativeLanguage} speakers",
      "guidance": "HOW to produce it correctly",
      "audio_model": "/phonetic transcription/",
      "practice_tip": "Practical exercise or mnemonic"
    }
  ]
}
```

**For Portuguese speakers learning English, prioritize:**
- /θ/ (think), /ð/ (the) — don't exist in Portuguese
- /ɹ/ (red) — different from Portuguese /r/
- Connected speech: "can I" → /kənaɪ/, "gimme" /ˈgɪmi/
- Final consonants (Portuguese often adds vowel)
- Word stress differences

---

## 5. ADAPTIVE METADATA

```json
{
  "adaptive_metadata": {
    "difficulty_band": "low | mid | high",
    "lexical_density": 0.52,
    "sentence_complexity_avg": 12.5,
    "chunk_reinforcement_score": 60,  // Must be ≥60
    "new_vocabulary_count": 8,
    "reading_time_estimate": "2-3 minutes",
    "content_tags": ["coffee shop", "first day", "work"],
    "cultural_context": "American coffee shop culture"
  }
}
```

---

## COMPLETE OUTPUT SCHEMA

Return this EXACT structure:

```json
{
  "module_type": "reading",
  "module_id": "{moduleId}",
  "cefr_level": "{cefrLevel}",
  "target_language": "{targetLanguage}",
  "native_language": "{nativeLanguage}",
  "generated_at": "2025-02-16T10:30:00Z",
  "pass_1_reference": "{moduleId}-lesson",
  
  "content": {
    "reading_text": {
      // See section 1 — with chunk_coverage_validation object
    },
    "vocabulary": [
      // See section 2 — 8-15 items
    ],
    "comprehension": [
      // See section 3 — EXACTLY 10 questions
    ],
    "pronunciation_focus": [
      // See section 4 — 5-8 points
    ],
    "adaptive_metadata": {
      // See section 5
    }
  },
  
  "validation": {
    "word_count_target": "80-120",
    "word_count_actual": 105,
    "word_count_in_range": true,
    "chunk_coverage_target": "≥60%",
    "chunk_coverage_actual": "60%",
    "chunk_coverage_met": true,
    "chunks_available": 15,
    "chunks_used": 9,
    "chunks_required": 9,
    "format_is_narrative": true,
    "comprehension_question_count": 10,
    "comprehension_count_correct": true
  }
}
```

---

## PRE-SUBMISSION VALIDATION CHECKLIST

**Before returning your JSON, verify:**

- [ ] Counted total chunks from Pass 1
- [ ] Used ≥60% of chunks (check: `chunks_used.length / total_chunks >= 0.6`)
- [ ] Word count within CEFR range for this level
- [ ] Text format is narrative (NOT social media/chat)
- [ ] **Counted comprehension questions = EXACTLY 10**
- [ ] Question types distributed as specified (2+3+3+2)
- [ ] All vocabulary items have definitions + translations
- [ ] Pronunciation points are L1-specific (mention {nativeLanguage})
- [ ] validation object is complete and accurate

---

## CRITICAL REMINDERS

### ✅ DO:
1. **Count chunks carefully** — if you get 15 chunks, use at least 9 (60%)
2. **Generate EXACTLY 10 questions** — count them as you write
3. **Stay within word count** — for A1, keep it 80-120 words
4. **Write flowing narrative** — proper paragraphs, not fragments
5. **Make it L1-specific** — mention Portuguese explicitly in pronunciation notes

### ❌ DON'T:
1. ❌ Generate 8 questions or 12 questions — must be EXACTLY 10
2. ❌ Use only 4/15 chunks when you need 9+ — track coverage
3. ❌ Write 300 words for A1 — respect CEFR ranges
4. ❌ Use chat/social media formats — narrative text only
5. ❌ Give generic pronunciation tips — explain WHY it's hard for Portuguese speakers

---

**END OF PROMPT**