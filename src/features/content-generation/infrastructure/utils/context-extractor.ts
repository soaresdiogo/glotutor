import type { PreviousPassOutputs } from '@/features/content-generation/domain/ports/prompt-composer.interface';

interface LessonChunk {
  id: string;
  chunk: string;
  context?: string;
}

interface LessonContent {
  content?: {
    chunks?: LessonChunk[];
    high_frequency_chunks?: LessonChunk[];
    grammar_patterns?: Array<{ pattern_label?: string }>;
    dialogue?: unknown;
    speech_map?: { reductions?: Array<{ spoken?: string }> };
    module_speech_map?: { reductions?: Array<{ spoken?: string }> };
    cognitive_reinforcement?: { identity_shift?: unknown };
    mistakes?: Array<{ why_wrong?: string }>;
  };
}

interface ReadingContent {
  content?: {
    reading_text?: { word_count?: number; chunks_used?: string[] };
    vocabulary?: Array<{ word?: string }>;
  };
}

interface PodcastContent {
  content?: {
    episode?: { speakers?: Array<{ personality?: string }> };
  };
}

/**
 * Extracts summarized context from Pass 1 (lesson) output for injection into Pass 2.
 */
export function extractPass1Context(
  pass1Output: LessonContent,
): PreviousPassOutputs {
  const content = pass1Output.content;
  if (!content) {
    console.warn(
      '[context-extractor] Pass 1 output has no content — subsequent passes will lack chunk context',
    );
    return {};
  }

  const chunks = content.chunks ?? content.high_frequency_chunks ?? [];
  if (chunks.length === 0) {
    console.warn(
      '[context-extractor] Pass 1 has 0 chunks — reading/podcast/speaking will fail chunk coverage validation',
    );
  }
  const chunksTaught = chunks.map((c) => ({
    id: c.id,
    chunk: c.chunk,
    context: c.context,
  }));

  const grammarPatterns = (content.grammar_patterns ?? []).map(
    (p) => p.pattern_label ?? '',
  );

  let dialogueSummary = '';
  if (content.dialogue && typeof content.dialogue === 'object') {
    const d = content.dialogue as { clean_version?: Array<{ line?: string }> };
    const lines = d.clean_version?.map((t) => t.line).filter(Boolean) ?? [];
    dialogueSummary = lines.join(' ').slice(0, 300);
  }

  const speechMap = content.speech_map ?? content.module_speech_map;
  const connectedSpeechFeatures =
    speechMap?.reductions?.map((r) => r.spoken).filter(Boolean) ?? [];

  return {
    from_pass_1: {
      chunks_taught: chunksTaught,
      grammar_patterns_used: grammarPatterns,
      dialogue_summary: dialogueSummary,
      connected_speech_features: connectedSpeechFeatures,
    },
  };
}

/**
 * Extracts summarized context from Pass 2 (reading) output for injection into Pass 3.
 */
export function extractPass2Context(
  pass2Output: ReadingContent,
  pass1Output: LessonContent,
): PreviousPassOutputs {
  const readingContent = pass2Output.content;
  const _lessonContent = pass1Output.content;

  let readingTheme = '';
  if (
    readingContent?.reading_text &&
    typeof readingContent.reading_text === 'object'
  ) {
    const rt = readingContent.reading_text as { content?: string };
    readingTheme =
      typeof rt.content === 'string' ? rt.content.slice(0, 200) : '';
  }

  const additionalVocabulary =
    readingContent?.vocabulary?.map((v) => v.word).filter(Boolean) ?? [];

  const pass1Context = extractPass1Context(pass1Output);

  return {
    ...pass1Context,
    from_pass_2: {
      reading_theme: readingTheme,
      additional_vocabulary: additionalVocabulary,
    },
    from_pass_1: {
      ...(pass1Context.from_pass_1 as object),
      dialogue_theme: (
        pass1Context.from_pass_1 as { dialogue_summary?: string }
      )?.dialogue_summary,
    },
  };
}

/**
 * Extracts summarized context from Pass 3 (podcast) output for injection into Pass 4.
 */
export function extractPass3Context(
  pass3Output: PodcastContent,
  pass1Context: PreviousPassOutputs,
  pass2Context: PreviousPassOutputs,
): PreviousPassOutputs {
  const podcastContent = pass3Output.content;
  const episode = podcastContent?.episode;
  const speakersUsed =
    episode?.speakers?.map((s) => s.personality).filter(Boolean) ?? [];

  let podcastScenario = '';
  if (episode && typeof episode === 'object') {
    const e = episode as { title?: string; description?: string };
    podcastScenario = [e.title, e.description].filter(Boolean).join(' ');
  }

  return {
    ...pass1Context,
    ...pass2Context,
    from_pass_3: {
      podcast_scenario: podcastScenario,
      speakers_used: speakersUsed,
    },
  };
}
