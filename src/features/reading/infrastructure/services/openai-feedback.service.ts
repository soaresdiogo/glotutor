import OpenAI from 'openai';
import type {
  FeedbackResult,
  FeedbackStats,
  IFeedbackAIService,
} from '@/features/reading/domain/ports/feedback-ai-service.interface';

export class OpenAIFeedbackService implements IFeedbackAIService {
  constructor(private readonly apiKey: string) {}

  async generateFeedback(stats: FeedbackStats): Promise<FeedbackResult> {
    const overallStart = Date.now();
    const total =
      stats.greenCount + stats.yellowCount + stats.redCount + stats.missedCount;
    const accuracy = total > 0 ? (stats.greenCount / total) * 100 : 0;

    const redWords = stats.wordScores
      .filter((w) => w.status === 'red' && w.expected)
      .map((w) => w.expected as string)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 8);

    if (!this.apiKey) {
      const duration = Date.now() - overallStart;
      if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
        console.info(
          `[Reading][Feedback] Using fallback feedback (no API key). Completed in ${duration}ms`,
        );
      }
      return {
        summary: `You read at ${stats.wpm} WPM with ${accuracy.toFixed(0)}% accuracy.`,
        tips: [
          stats.redCount > 0
            ? 'Practice the red words by clicking them to hear correct pronunciation.'
            : '',
          stats.yellowCount > 0
            ? 'The yellow words are close — try articulating more clearly.'
            : '',
          stats.missedCount > 0
            ? 'Try to read every word; skip less next time.'
            : '',
        ].filter(Boolean),
        focusWords: redWords,
        nextSteps: [],
        speed:
          stats.wpm < 80 ? 'slow' : stats.wpm > 160 ? 'fast' : 'comfortable',
        clarity:
          accuracy > 90
            ? 'very clear'
            : accuracy > 70
              ? 'mostly clear with some blurriness'
              : 'needs clearer articulation',
        intonation: 'not evaluated (AI feedback disabled)',
      };
    }

    const redWordsForPrompt = stats.wordScores
      .filter((w) => w.status === 'red' && w.expected)
      .map((w) => w.expected as string)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10);

    const openai = new OpenAI({ apiKey: this.apiKey });
    const openAiStart = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a supportive language tutor. Given reading practice stats, return a JSON object with: summary (string, max 20 words), tips (array of 2-3 strings, max 15 words each), focusWords (array of words, max 8), nextSteps (array of 1-2 strings, max 15 words each). Be concise and encouraging. Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Level: ${stats.level}. WPM: ${stats.wpm}. Accuracy: ${accuracy.toFixed(
            0,
          )}%. Green: ${stats.greenCount}, Yellow: ${stats.yellowCount}, Red: ${stats.redCount}, Missed: ${stats.missedCount}. Words to focus: ${
            redWordsForPrompt.join(', ') || 'none'
          }.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });
    const openAiDuration = Date.now() - openAiStart;
    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      console.info(
        `[Reading][Feedback] OpenAI gpt-4o-mini completed in ${openAiDuration}ms (level=${stats.level}, wpm=${stats.wpm})`,
      );
    }

    const raw = completion.choices[0]?.message?.content?.trim() ?? '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    let data: FeedbackResult;
    try {
      data = JSON.parse(cleaned) as FeedbackResult;
    } catch {
      data = {
        summary: `You read at ${stats.wpm} WPM with ${accuracy.toFixed(0)}% accuracy.`,
        tips: [],
        focusWords: redWords.slice(0, 8),
        nextSteps: [],
      };
    }
    if (!Array.isArray(data.focusWords)) data.focusWords = redWords.slice(0, 8);
    if (!Array.isArray(data.tips)) data.tips = [];
    if (!Array.isArray(data.nextSteps)) data.nextSteps = [];
    // Ensure qualitative fields are always present for consumers.
    if (!data.speed) {
      data.speed =
        stats.wpm < 80 ? 'slow' : stats.wpm > 160 ? 'fast' : 'comfortable';
    }
    if (!data.clarity) {
      data.clarity =
        accuracy > 90
          ? 'very clear'
          : accuracy > 70
            ? 'mostly clear with some blurriness'
            : 'needs clearer articulation';
    }
    if (!data.intonation) {
      data.intonation = 'natural overall with room for expressiveness';
    }
    const duration = Date.now() - overallStart;
    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      console.info(
        `[Reading][Feedback] generateFeedback total ${duration}ms (tips=${data.tips.length}, focusWords=${data.focusWords.length})`,
      );
    }
    return data;
  }
}
