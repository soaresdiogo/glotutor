import OpenAI from 'openai';

import type {
  GeneratedExercise,
  GeneratedExercises,
  GeneratedPodcastScript,
  IAIGateway,
  OpenEndedEvaluation,
} from '@/features/listening/domain/ports/ai-gateway.interface';

const SCRIPT_SYSTEM = `You are an expert language teacher creating podcast content for language learners.
Generate a DIALOGUE podcast script in the target language for the given CEFR level.

RULES:
- The script MUST be a conversation between TWO named characters. Use character-appropriate names for the target language (e.g. Maria and João for Portuguese, Sophie and Lucas for French, Anna and Tom for German, etc.).
- You MUST output speakerSegments with alternating speakers "A" and "B". Speaker A = first character, Speaker B = second character. Each segment must be a complete conversational turn (a full sentence or short exchange), NOT single words.
- Include natural conversational elements: greetings, filler words ("well...", "hmm", "let me think...", "you know"), and reactions ("oh, great!", "sure!", "really?").
- For A1–A2: use slow, clear, simple language but keep it natural and conversational. For B1–C2: natural pace and richer vocabulary.
- The script MUST have speakerSegments; do not return empty or single-speaker scripts.

Respond ONLY in valid JSON with this exact structure:
{
  "title": "string",
  "description": "string",
  "script": "string (full text of the dialogue)",
  "transcript": "string (same as script, optionally with speaker labels)",
  "vocabularyHighlights": [{ "word": "string", "translation": "string" }],
  "speakerSegments": [{ "speaker": "A" | "B", "text": "string (one complete turn per segment)" }]
}`;

const EXERCISES_SYSTEM = `You are creating comprehension exercises for a language learning podcast.
Generate exactly 5 exercises. Respond ONLY in valid JSON:
{
  "exercises": [
    {
      "questionNumber": 1,
      "type": "multiple_choice",
      "questionText": "string (in targetLanguage)",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string (exact match to one option)",
      "explanationText": "string (in nativeLanguage)"
    },
    { "questionNumber": 2, "type": "true_false", "questionText": "...", "options": ["True", "False"], "correctAnswer": "True" | "False", "explanationText": "..." },
    { "questionNumber": 3, "type": "fill_blank", "questionText": "sentence with ___", "options": null, "correctAnswer": "word", "explanationText": "..." },
    { "questionNumber": 4, "type": "sentence_order", "questionText": "Put in order:", "options": ["s1", "s2", "s3", "s4"], "correctAnswer": "1,3,2,4", "explanationText": "..." },
    { "questionNumber": 5, "type": "open_ended", "questionText": "...", "options": null, "correctAnswer": "ideal answer", "explanationText": "..." }
  ]
}`;

const EVAL_SYSTEM = `Evaluate the student's answer. Respond in JSON only: { "score": 0 | 1, "feedback": "string (in nativeLanguage)" }`;

export class OpenAIAIGateway implements IAIGateway {
  constructor(private readonly apiKey: string) {}

  async generatePodcastScript(params: {
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
    topic: string;
    durationTarget: string;
  }): Promise<GeneratedPodcastScript> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    const openai = new OpenAI({ apiKey: this.apiKey });
    const userContent = `Generate a dialogue podcast script in ${params.targetLanguage} for CEFR level ${params.cefrLevel}.
Topic: ${params.topic}
Duration target: ${params.durationTarget} words.

Use TWO named characters appropriate for ${params.targetLanguage}. Output speakerSegments with alternating "A" and "B"; each segment = one complete conversational turn. Include natural fillers and reactions. Vocabulary and grammar MUST match the CEFR level. Include title, description, script, transcript, vocabularyHighlights (5-8 key words with translations to ${params.nativeLanguage}), and speakerSegments (required).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SCRIPT_SYSTEM },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty script response');
    const parsed = JSON.parse(raw) as GeneratedPodcastScript;
    return {
      title: parsed.title ?? '',
      description: parsed.description ?? '',
      script: parsed.script ?? '',
      transcript: parsed.transcript ?? parsed.script ?? '',
      vocabularyHighlights: Array.isArray(parsed.vocabularyHighlights)
        ? parsed.vocabularyHighlights
        : [],
      speakerSegments: parsed.speakerSegments,
    };
  }

  async generateExercises(params: {
    transcript: string;
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
  }): Promise<GeneratedExercises> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    const openai = new OpenAI({ apiKey: this.apiKey });
    const userContent = `Student's native language: ${params.nativeLanguage}. Podcast in ${params.targetLanguage} at CEFR ${params.cefrLevel}.

Podcast transcript:
---
${params.transcript}
---

Generate exactly 5 exercises (multiple_choice, true_false, fill_blank, sentence_order, open_ended). Questions in ${params.targetLanguage}, explanations in ${params.nativeLanguage}.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXERCISES_SYSTEM },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty exercises response');
    const parsed = JSON.parse(raw) as { exercises?: GeneratedExercise[] };
    const exercises = Array.isArray(parsed.exercises) ? parsed.exercises : [];
    return { exercises };
  }

  async evaluateOpenEndedAnswer(params: {
    questionText: string;
    expectedAnswer: string;
    studentAnswer: string;
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
  }): Promise<OpenEndedEvaluation> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    const openai = new OpenAI({ apiKey: this.apiKey });
    const userContent = `Question: ${params.questionText}
Expected: ${params.expectedAnswer}
Student's answer: ${params.studentAnswer}
Language: ${params.targetLanguage}, level ${params.cefrLevel}. Native: ${params.nativeLanguage}.
Evaluate content accuracy (0 or 1) and give brief feedback in ${params.nativeLanguage}.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EVAL_SYSTEM },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { score: 0, feedback: 'Could not evaluate.' };
    const parsed = JSON.parse(raw) as { score?: number; feedback?: string };
    const score = parsed.score === 1 ? 1 : 0;
    return {
      score,
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
    };
  }
}
