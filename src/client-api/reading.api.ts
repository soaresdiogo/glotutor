import { httpClient } from '@/shared/lib/http-client';

export type ReadingTextListItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  level: string;
  cefrLevel: string | null;
  wordCount: number | null;
  estimatedMinutes: number | null;
  languageCode: string;
  /** True when the user has at least one completed reading session for this text. */
  completed?: boolean;
};

export type TextVocabularyItem = {
  word: string;
  phoneticIpa: string | null;
  definition: string | null;
  exampleSentence: string | null;
  partOfSpeech: string | null;
};

export type ComprehensionQuestion = {
  id: string;
  type: string;
  question: string;
  question_translation?: string;
  correct_answer: string;
  explanation: string;
  tests?: string;
  difficulty?: string;
};

export type ReadingTextDetail = {
  id: string;
  title: string;
  content: string;
  category: string;
  level: string;
  cefrLevel: string | null;
  wordCount: number | null;
  estimatedMinutes: number | null;
  languageCode: string;
  vocabulary: TextVocabularyItem[];
  /** Present when content was generated with comprehension questions. */
  comprehension?: ComprehensionQuestion[];
};

export type WordScorePayload = {
  status: 'green' | 'yellow' | 'red' | 'missed';
  similarity: number;
  confidence: number;
  phoneticMatch: boolean;
  combinedScore: number;
  expected: string;
  spoken: string;
  index: number;
};

export type EvaluateResponse = {
  sessionId: string;
  wordScores: WordScorePayload[];
  metrics: {
    wpm: number;
    accuracy: number;
    fluency: number;
    overall: number;
    duration: number;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    missedCount: number;
  };
};

export type ComprehensionAnswerEntry = {
  answer: string;
  correct: boolean;
};

export type LastSessionPayload = {
  sessionId: string;
  wordScores: WordScorePayload[];
  metrics: EvaluateResponse['metrics'];
  feedback: FeedbackResponse | null;
  grammarItems: GrammarItem[];
  /** Saved comprehension answers per question key. */
  comprehensionAnswers?: Record<string, ComprehensionAnswerEntry> | null;
};

export type GrammarItem = {
  sentence: string;
  structure: string;
  explanation: string;
  pattern: string;
  level: string;
};

export type FeedbackResponse = {
  summary: string;
  tips: string[];
  focusWords: string[];
  nextSteps: string[];
  speed?: string;
  clarity?: string;
  intonation?: string;
};

export const readingApi = {
  listTexts: (params?: { language?: string; level?: string }) =>
    httpClient
      .get('reading/texts', { searchParams: params ?? {} })
      .json<{ texts: ReadingTextListItem[] }>(),

  getText: (id: string) =>
    httpClient.get(`reading/texts/${id}`).json<ReadingTextDetail>(),

  evaluate: (formData: FormData) =>
    httpClient
      .post('reading/evaluate', { body: formData, timeout: 120000 })
      .json<EvaluateResponse>(),

  getPronunciation: (word: string, language: string) =>
    httpClient
      .post('reading/pronunciation', {
        json: { word, language },
      })
      .json<{ audioUrl: string }>(),

  getWordDetails: (word: string, textLanguageCode: string) =>
    httpClient
      .post('reading/word-details', {
        json: { word, textLanguageCode },
      })
      .json<{ phoneticIpa: string | null; definition: string | null }>(),

  getGrammarAnalysis: (payload: {
    textId?: string;
    content?: string;
    level?: string;
    language?: string;
  }) =>
    httpClient
      .post('reading/grammar-analysis', { json: payload })
      .json<{ items: GrammarItem[] }>(),

  getFeedback: (payload: {
    wordScores: WordScorePayload[];
    wpm: number;
    level: string;
    greenCount: number;
    yellowCount: number;
    redCount: number;
    missedCount: number;
  }) =>
    httpClient
      .post('reading/feedback', { json: payload })
      .json<FeedbackResponse>(),

  getLastSession: (textId: string) =>
    httpClient
      .get(`reading/session?textId=${encodeURIComponent(textId)}`)
      .json<{ session: LastSessionPayload | null }>(),

  saveSessionFeedback: (
    sessionId: string,
    payload: { feedback: FeedbackResponse; grammarItems: GrammarItem[] },
  ) =>
    httpClient
      .patch(`reading/session/${encodeURIComponent(sessionId)}`, {
        json: payload,
      })
      .json<{ ok: boolean }>(),

  saveComprehensionAnswers: (
    sessionId: string,
    answers: Record<string, ComprehensionAnswerEntry>,
  ) =>
    httpClient
      .patch(`reading/session/${encodeURIComponent(sessionId)}/comprehension`, {
        json: { answers },
      })
      .json<{ ok: boolean }>(),
};
