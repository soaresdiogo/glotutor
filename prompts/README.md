# /prompts — Glotutor Content Generation Prompts

## Structure

Prompt files live in subdirectories so the loader can resolve them reliably:

```
/prompts
├── base/                          # Shared foundations (loaded in every generation call)
│   ├── 00-BASE-SYSTEM.md          # Core philosophy, adaptive triggers, identity shift, constraints
│   └── 01-LEVEL-PARAMS.md         # CEFR A1-C2 configurations (chunk counts, formats, thresholds)
│
├── passes/                        # One prompt per generation pass
│   ├── 02-PASS-LESSON.md          # Pass 1: Chunks, dialogue, grammar, exercises, cognitive reinforcement
│   ├── 03-PASS-READING.md         # Pass 2: Formatted texts, vocabulary, comprehension, pronunciation
│   ├── 04-PASS-PODCAST.md         # Pass 3: Episode scripts, speech annotations, listening exercises
│   └── 05-PASS-SPEAKING.md        # Pass 4: Scenarios, AI character, evaluation, fluency gym
│
├── references/                    # Static reference data
│   └── 06-MODULE-LIST.md          # All 60 modules with IDs, themes, formats, priorities
│
├── CURSOR-PROMPT.md               # Implementation instructions for Cursor
└── README.md                      # This file
```

The generation script loads from `base/`, `passes/`, and `references/` (see `@/features/content-generation/infrastructure/utils/prompt-loader`).

**Podcast TTS:** The pipeline saves podcast rows with transcript and empty `audioUrl`. To generate and upload audio, run the TTS step after content generation:
`npm run generate-podcast-tts -- --podcast-id <uuid>`.

## How It Works

### Prompt Composition

Every LLM call is composed from modular pieces:

```
SYSTEM MESSAGE = 00-BASE-SYSTEM.md (with variables injected)

USER MESSAGE = 
  Level config from 01-LEVEL-PARAMS.md (relevant section only)
  + Pass prompt (02, 03, 04, or 05) with variables injected
  + Context from previous passes (if applicable)
```

### Variable Placeholders

Prompts use `{variableName}` syntax. The script replaces these at runtime:

| Variable | Source | Example |
|----------|--------|---------|
| `{moduleId}` | CLI input or module list | `a1-coffee-shop` |
| `{title}` | Module list | `Coffee Shop Survival` |
| `{cefrLevel}` | CLI input | `A1` |
| `{targetLanguage}` | CLI input | `en-US` |
| `{nativeLanguage}` | CLI input | `pt-BR` |
| `{situationalTheme}` | Module list | `Ordering food & drinks` |
| `{chunkCount}` | Level params | `15-20` |
| `{readingFormat}` | Module list | `whatsapp_chat` |
| `{variationCount}` | Level params | `3-5` |
| `{chunks_taught}` | Pass 1 output | JSON array of chunks |

### Pass Dependencies

```
Pass 1 (Lesson)    → standalone, no dependencies
Pass 2 (Reading)   → needs chunks + patterns from Pass 1
Pass 3 (Podcast)   → needs chunks from Pass 1 + theme from Pass 2
Pass 4 (Speaking)  → needs chunks from Pass 1 + context from Pass 2 + 3
```

## How to Edit Prompts

1. **Find the right file.** Each prompt has a clear purpose — don't mix concerns.
2. **Edit the `.md` file directly.** No code changes needed.
3. **Test with review mode.** Run `--review` flag to see output before saving.
4. **Keep placeholders consistent.** If you add a new `{variable}`, update the injector.

### Common Edits

| Want to... | Edit this file |
|------------|---------------|
| Change core philosophy or rules | `00-BASE-SYSTEM.md` |
| Adjust chunk counts or exercise types for a level | `01-LEVEL-PARAMS.md` |
| Change lesson structure or add sections | `02-PASS-LESSON.md` |
| Add a new reading format | `03-PASS-READING.md` |
| Modify podcast script rules | `04-PASS-PODCAST.md` |
| Change AI character behavior in speaking | `05-PASS-SPEAKING.md` |
| Add/modify/reorder modules | `06-MODULE-LIST.md` |

## Token Budget

| Component | ~Tokens | Notes |
|-----------|---------|-------|
| Base system prompt | 2,000 | Sent as system message |
| Level params (1 level) | 500 | Extracted section only |
| Pass prompt | 2,000 | One pass at a time |
| Previous pass context | 500-1,000 | Summarized, not full |
| **Total input** | **~5,000-5,500** | Per API call |
| Expected output | 4,000-8,000 | Varies by pass/level |

This modular approach uses ~60% fewer tokens than sending everything in one prompt.
