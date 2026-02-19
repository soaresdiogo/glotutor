/**
 * Content generation pipeline types.
 * Prompts are loaded from /prompts directory; never hardcoded.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ContentPass = 'lesson' | 'reading' | 'podcast' | 'speaking';

export interface GenerationRequest {
  /** e.g. "a1-coffee-shop" */
  moduleId: string;
  cefrLevel: CEFRLevel;
  /** e.g. "en-US" */
  targetLanguage: string;
  /** e.g. "pt-BR" */
  nativeLanguage: string;
  /** Auto-resolved from MODULE-LIST if not provided */
  title?: string;
  situationalTheme?: string;
  /** e.g. "whatsapp_chat" or "menu + whatsapp_chat" */
  readingFormat?: string;
  /** Which passes to run (order: lesson → reading → podcast → speaking) */
  passesToRun: ContentPass[];
  /** If true, output to console for review before saving */
  reviewMode?: boolean;
  /** Extra context for the LLM */
  specificInstructions?: string;
}

/** Level params extracted from 01-LEVEL-PARAMS.md for one CEFR level */
export interface LevelParams {
  level: string;
  label?: string;
  cognitive_goal?: string;
  identity_goal?: string;
  content_params?: {
    chunk_count?: { min: number; max: number };
    dialogue_complexity?: string;
    max_sentence_length?: number | string;
    clause_complexity?: string;
    lexical_band?: string;
    phrasal_verb_density?: string;
    idiomatic_density?: string;
    filler_frequency?: string;
    self_correction?: string;
  };
  grammar_patterns?: string[];
  connected_speech?: string[];
  reading?: {
    formats?: string[];
    word_count?: { min: number; max: number };
  };
  listening?: {
    format?: string;
    duration_minutes?: { min: number; max: number };
    speakers?: string;
    speech_rate?: string;
    styles?: string[];
  };
  speaking?: {
    duration_seconds?: number;
    types?: string[];
    ai_behavior?: string;
  };
  exercises?: {
    types?: string[];
    variation_count?: { min: number; max: number };
  };
  adaptive_thresholds?: Record<string, number>;
  fluency_score_weights?: Record<string, number>;
  [key: string]: unknown;
}

/** Single module row from 06-MODULE-LIST.md */
export interface ModuleMetadata {
  moduleId: string;
  title: string;
  situationalTheme: string;
  readingFormat: string;
  phase?: string;
  level: CEFRLevel;
}

/** Full spec passed to prompt composition (module + level params + optional previous outputs) */
export interface ModuleSpec {
  moduleId: string;
  title: string;
  cefrLevel: CEFRLevel;
  targetLanguage: string;
  nativeLanguage: string;
  situationalTheme: string;
  readingFormat: string;
  coreModuleNumber?: string;
  specificInstructions?: string;
  /** From level params */
  contentParams: LevelParams['content_params'] & {
    chunkCount?: { min: number; max: number };
    readingWordCount?: { min: number; max: number };
    variationCount?: { min: number; max: number };
  };
  levelParams: LevelParams;
}

/** Composed prompt for one LLM call */
export interface ComposedPrompt {
  systemPrompt: string;
  userMessage: string;
}
