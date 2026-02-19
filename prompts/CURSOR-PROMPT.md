# CURSOR PROMPT — Implement Content Generation Pipeline for Glotutor

## CONTEXT

Glotutor is an AI-first language learning platform that teaches through native speech patterns. The platform has 4 content features:
1. **Lições Nativas (Lessons)** — Core lesson content with chunks, dialogues, grammar patterns, exercises
2. **Reading Practice (Read Aloud)** — Texts in various formats for pronunciation practice
3. **Podcasts (Listening)** — AI-generated audio episodes with comprehension exercises
4. **Speaking Practice** — Real-time voice conversation scenarios with AI characters

We need a **content generation pipeline** that uses LLM (Claude/OpenAI) to generate all content for these features following the **Native Cognition Framework**.

## WHAT TO BUILD

### 1. Prompt Management System

Create a `/prompts` directory in the project with the following structure:

```
/prompts
├── base/
│   ├── 00-BASE-SYSTEM.md        # Shared system prompt (inherited by all passes)
│   └── 01-LEVEL-PARAMS.md       # CEFR level configurations (A1-C2)
├── passes/
│   ├── 02-PASS-LESSON.md        # Pass 1: Lesson generation prompt
│   ├── 03-PASS-READING.md       # Pass 2: Reading content prompt
│   ├── 04-PASS-PODCAST.md       # Pass 3: Podcast/Listening prompt
│   └── 05-PASS-SPEAKING.md      # Pass 4: Speaking scenarios prompt
├── references/
│   └── 06-MODULE-LIST.md        # Complete module list with IDs and metadata
└── README.md                    # How to use and modify prompts
```

**Rules for prompt management:**
- All prompts are `.md` files stored in this directory — NEVER hardcoded in source code
- The generation script reads prompts from these files at runtime
- This makes prompts easy to find, edit, and version-control independently of code
- Each prompt file has clear placeholders using `{variableName}` syntax for dynamic injection

### 2. Content Generation Script

Create a script/module (following the project's existing clean architecture) that:

#### Input Interface

```typescript
interface GenerationRequest {
  // Required
  moduleId: string;           // e.g., "a1-coffee-shop"
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  targetLanguage: string;     // e.g., "en-US"
  nativeLanguage: string;     // e.g., "pt-BR"
  
  // Auto-resolved from MODULE-LIST if not provided
  title?: string;
  situationalTheme?: string;
  readingFormat?: string;
  
  // Control
  passesToRun: ("lesson" | "reading" | "podcast" | "speaking")[];
  reviewMode?: boolean;       // If true, outputs to console for review before saving
  specificInstructions?: string; // Extra context for the LLM
}
```

#### Pipeline Logic

```
1. RESOLVE MODULE SPEC
   - Load module metadata from 06-MODULE-LIST.md (or a parsed JSON version)
   - Load level parameters from 01-LEVEL-PARAMS.md for the specified CEFR level
   - Build the complete ModuleSpec object with all parameters filled in

2. BUILD PROMPTS
   - Load 00-BASE-SYSTEM.md as the foundation
   - For each pass to run:
     a. Load the pass-specific prompt file (02, 03, 04, or 05)
     b. Inject module-specific variables into placeholders
     c. If not the first pass, inject context from previous pass outputs
   - Compose final prompt = BASE_SYSTEM + LEVEL_PARAMS (relevant section) + PASS_PROMPT (with injected variables)

3. EXECUTE PASSES SEQUENTIALLY
   For each pass in passesToRun:
     a. Compose the prompt (base + level + pass-specific + previous pass context)
     b. Call LLM API with the composed prompt
     c. Parse the JSON response
     d. Validate against expected schema
     e. Store the output (for injection into next pass)
     f. If reviewMode: print to console and wait for confirmation
     g. If not reviewMode: save directly to database

4. SAVE TO DATABASE
   - Map each pass output to the corresponding platform feature's data model
   - Lesson → lessons table/collection
   - Reading → reading_contents table/collection
   - Podcast → podcast_episodes table/collection
   - Speaking → speaking_scenarios table/collection
```

#### Prompt Composition Function

```typescript
// This is the core function that composes prompts from the modular files
async function composePrompt(
  pass: "lesson" | "reading" | "podcast" | "speaking",
  moduleSpec: ModuleSpec,
  previousPassOutputs?: Record<string, any>
): Promise<string> {
  // 1. Load base system prompt
  const basePrompt = await loadPromptFile('base/00-BASE-SYSTEM.md');
  
  // 2. Load and extract relevant level config
  const levelParams = await loadLevelParams(moduleSpec.cefrLevel);
  
  // 3. Load pass-specific prompt
  const passPromptMap = {
    lesson: 'passes/02-PASS-LESSON.md',
    reading: 'passes/03-PASS-READING.md',
    podcast: 'passes/04-PASS-PODCAST.md',
    speaking: 'passes/05-PASS-SPEAKING.md'
  };
  const passPrompt = await loadPromptFile(passPromptMap[pass]);
  
  // 4. Inject variables
  const injectedPrompt = injectVariables(passPrompt, {
    ...moduleSpec,
    ...levelParams,
    ...(previousPassOutputs || {})
  });
  
  // 5. Compose final prompt
  // BASE is the system prompt, LEVEL + PASS go in the user message
  return {
    systemPrompt: injectVariables(basePrompt, moduleSpec),
    userMessage: `## LEVEL CONFIGURATION\n${JSON.stringify(levelParams, null, 2)}\n\n${injectedPrompt}`
  };
}
```

#### Variable Injection

The prompt files use `{variableName}` placeholders. The script must replace these with actual values:

```typescript
function injectVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in variables) {
      const value = variables[key];
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    return match; // Keep placeholder if no value provided
  });
}
```

Key variables to inject:
- `{moduleId}`, `{title}`, `{cefrLevel}`, `{targetLanguage}`, `{nativeLanguage}`
- `{situationalTheme}`, `{cognitiveGoal}`, `{readingFormat}`
- `{chunkCount}` (from level params)
- `{variationCount}` (from level params)
- `{readingWordCount}` (from level params)
- Previous pass context: `{chunks_taught}`, `{grammar_patterns}`, `{dialogue_summary}`, etc.

#### Context Passing Between Passes

When running multiple passes, each pass needs context from previous ones:

```typescript
// After Pass 1 (Lesson), extract context for Pass 2:
const pass1Context = {
  chunks_taught: pass1Output.content.chunks.map(c => ({
    id: c.id,
    chunk: c.chunk,
    context: c.context
  })),
  grammar_patterns: pass1Output.content.grammar_patterns.map(p => p.pattern_label),
  dialogue_summary: summarizeDialogue(pass1Output.content.dialogue),
  connected_speech_features: pass1Output.content.speech_map.reductions.map(r => r.spoken)
};

// After Pass 2 (Reading), extract context for Pass 3:
const pass2Context = {
  reading_theme: summarizeReading(pass2Output.content.reading_text),
  additional_vocabulary: pass2Output.content.vocabulary.map(v => v.word)
};

// After Pass 3 (Podcast), extract context for Pass 4:
const pass3Context = {
  podcast_scenario: summarizePodcast(pass3Output.content.episode),
  speakers_used: pass3Output.content.episode.speakers.map(s => s.personality)
};
```

#### Token Optimization

To avoid hitting token limits and reduce costs:

```typescript
// The BASE_SYSTEM prompt is sent as the system message (loaded once per session)
// The PASS prompt + context is sent as the user message
// Previous pass context is SUMMARIZED, not sent in full

// Token budget per pass (approximate):
// System prompt (BASE): ~2,000 tokens
// Level params: ~500 tokens  
// Pass prompt: ~2,000 tokens
// Previous pass context (summarized): ~500-1,000 tokens
// Total input: ~5,000-5,500 tokens
// Expected output: ~4,000-8,000 tokens (varies by pass and level)

// For comparison, sending everything in one prompt would be ~15,000+ tokens input
```

### 3. CLI Interface

Create a simple CLI command to trigger generation:

```bash
# Generate all 4 passes for a single module
npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR

# Generate only specific passes
npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --passes lesson,reading

# Generate in review mode (prints output, doesn't save)
npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --review

# Batch generate all P1 modules for a language
npm run generate-content -- --batch p1 --target en-US --native pt-BR

# Generate a single pass with extra instructions
npm run generate-content -- --module a1-coffee-shop --level A1 --target en-US --native pt-BR --passes lesson --instructions "Focus on American coffee shop culture. Include tipping context."
```

### 4. Validation & Quality Gates

After each LLM response, validate:

```typescript
interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function validateLessonOutput(output: any, moduleSpec: ModuleSpec): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check chunk count
  const chunkCount = output.content.chunks?.length || 0;
  if (chunkCount < moduleSpec.contentParams.chunkCount.min) {
    errors.push(`Chunk count ${chunkCount} below minimum ${moduleSpec.contentParams.chunkCount.min}`);
  }
  
  // Check for grammar terminology (should be invisible)
  const grammarTerms = ['present perfect', 'past simple', 'conditional', 'subjunctive', 'gerund', 'infinitive', 'conjugation', 'declension'];
  const textContent = JSON.stringify(output.content);
  grammarTerms.forEach(term => {
    if (textContent.toLowerCase().includes(term)) {
      errors.push(`Grammar terminology detected: "${term}" — grammar must be invisible`);
    }
  });
  
  // Check connected speech features exist
  if (!output.content.speech_map || output.content.speech_map.reductions?.length === 0) {
    errors.push('No connected speech features found — every module must include speech mapping');
  }
  
  // Check adaptive metadata exists
  if (!output.content.adaptive_metadata) {
    errors.push('Missing adaptive metadata');
  }
  
  // Check identity shift exists
  if (!output.content.cognitive_reinforcement?.identity_shift) {
    warnings.push('Missing identity shift definition');
  }
  
  // Check L1-specific mistakes
  if (output.content.mistakes) {
    const genericCount = output.content.mistakes.filter(m => 
      !m.why_wrong.includes(moduleSpec.nativeLanguage) && 
      !m.why_wrong.includes('speakers of')
    ).length;
    if (genericCount > output.content.mistakes.length * 0.5) {
      warnings.push('More than 50% of mistakes appear generic — should be L1-specific');
    }
  }
  
  return { passed: errors.length === 0, errors, warnings };
}

function validateReadingOutput(output: any, moduleSpec: ModuleSpec, pass1Output: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check chunk coverage (must be 60-70%)
  const totalChunks = pass1Output.content.chunks.length;
  const usedChunks = output.content.reading_text.chunks_used?.length || 0;
  const coverage = (usedChunks / totalChunks) * 100;
  if (coverage < 60) {
    errors.push(`Chunk coverage ${coverage.toFixed(0)}% below minimum 60%`);
  }
  if (coverage > 80) {
    warnings.push(`Chunk coverage ${coverage.toFixed(0)}% seems forced — check naturalness`);
  }
  
  // Check word count
  const wordCount = output.content.reading_text.word_count;
  if (wordCount < moduleSpec.contentParams.readingWordCount.min) {
    errors.push(`Word count ${wordCount} below minimum ${moduleSpec.contentParams.readingWordCount.min}`);
  }
  
  // Check comprehension question mix
  const questions = output.content.comprehension || [];
  const types = questions.map(q => q.tests);
  if (!types.includes('inference')) {
    warnings.push('No inference questions — add at least 1-2');
  }
  
  return { passed: errors.length === 0, errors, warnings };
}

// Similar validators for podcast and speaking outputs...
```

### 5. Database Mapping

Map each pass output to the platform's existing data models:

```typescript
// This depends on the existing schema — adapt to your models
async function saveLesson(output: LessonOutput, moduleSpec: ModuleSpec): Promise<void> {
  // Map to your existing lesson schema
  // The output JSON structure should be designed to match your DB models
  // If there's a mismatch, create a mapper function here
}

async function saveReading(output: ReadingOutput, moduleSpec: ModuleSpec): Promise<void> {
  // Map to your existing reading content schema
}

async function savePodcast(output: PodcastOutput, moduleSpec: ModuleSpec): Promise<void> {
  // Map to your existing podcast episode schema
}

async function saveSpeaking(output: SpeakingOutput, moduleSpec: ModuleSpec): Promise<void> {
  // Map to your existing speaking scenario schema
}
```

## IMPORTANT ARCHITECTURE NOTES

1. **Prompts are FILES, not code.** Never hardcode prompt text in TypeScript/JavaScript. Always load from the `/prompts` directory. This makes it easy to iterate on prompts without touching code.

2. **Follow the project's existing clean architecture.** The generation script should be a use-case in the domain layer, with the LLM API call in the infrastructure layer.

3. **Token optimization matters.** The BASE_SYSTEM prompt is ~2,000 tokens. Each PASS prompt is ~2,000 tokens. Previous pass context should be SUMMARIZED to ~500-1,000 tokens. Total per call should stay under 6,000 input tokens.

4. **Sequential execution is intentional.** Passes MUST run in order (lesson → reading → podcast → speaking) because each pass needs context from the previous one. Do not parallelize.

5. **Review mode is critical for quality.** During initial content creation, always run in review mode. Once prompts are stable, switch to batch mode for scale.

6. **Validation happens BEFORE saving.** If validation fails, log the errors and either retry with adjusted prompt or flag for manual review. Never save invalid content.

## FILES TO CREATE

```
/prompts/
├── base/
│   ├── 00-BASE-SYSTEM.md
│   └── 01-LEVEL-PARAMS.md
├── passes/
│   ├── 02-PASS-LESSON.md
│   ├── 03-PASS-READING.md
│   ├── 04-PASS-PODCAST.md
│   └── 05-PASS-SPEAKING.md
├── references/
│   └── 06-MODULE-LIST.md
└── README.md

/src/domain/use-cases/
└── generate-module-content.ts    # Main pipeline orchestrator

/src/domain/interfaces/
└── content-generator.ts          # Interface for the generation service

/src/infrastructure/services/
└── llm-content-generator.ts      # LLM API implementation

/src/infrastructure/utils/
├── prompt-loader.ts              # Loads and composes prompts from /prompts directory
├── variable-injector.ts          # Replaces {placeholders} with values
└── content-validator.ts          # Validates LLM output against schemas

/src/presentation/cli/
└── generate-content.ts           # CLI entry point
```

## PROMPT FILE CONTENTS

The actual prompt contents are provided in the separate files:
- `00-BASE-SYSTEM.md` — Shared system prompt with core philosophy, adaptive triggers, identity shift framework, linguistic complexity constraints
- `01-LEVEL-PARAMS.md` — Complete CEFR level configurations (A1-C2) with all parameters
- `02-PASS-LESSON.md` — Lesson generation with 10 sections: chunks, grammar, dialogue, variations, speech map, mistakes, exercises, cognitive reinforcement, cultural notes, adaptive metadata
- `03-PASS-READING.md` — Reading content with format specifications for 15+ text types, vocabulary, comprehension, pronunciation focus
- `04-PASS-PODCAST.md` — Podcast scripts with connected speech annotations, comprehension exercises, speed versions
- `05-PASS-SPEAKING.md` — Speaking scenarios with AI character behavior, evaluation criteria, feedback model, fluency gym drills
- `06-MODULE-LIST.md` — Complete list of 60 modules across 6 levels with priorities and production phases

Copy the contents of each prompt file from the provided files into the corresponding location in the `/prompts` directory.
