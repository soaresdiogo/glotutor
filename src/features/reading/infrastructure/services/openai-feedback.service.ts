import OpenAI from 'openai';
import type {
  FeedbackResult,
  FeedbackStats,
  IFeedbackAIService,
} from '@/features/reading/domain/ports/feedback-ai-service.interface';

function getSpeedLabel(wpm: number): string {
  if (wpm < 80) return 'slow';
  if (wpm > 160) return 'fast';
  return 'comfortable';
}

function getClarityLabel(accuracy: number): string {
  if (accuracy > 90) return 'very clear';
  if (accuracy > 70) return 'mostly clear with some blurriness';
  return 'needs clearer articulation';
}

function getRedWords(stats: FeedbackStats, limit: number): string[] {
  return stats.wordScores
    .filter((w) => w.status === 'red' && w.expected)
    .map((w) => w.expected as string)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, limit);
}

function buildFallbackTips(stats: FeedbackStats): string[] {
  const tips: string[] = [];
  if (stats.redCount > 0) {
    tips.push(
      'Practice the red words by clicking them to hear correct pronunciation.',
    );
  }
  if (stats.yellowCount > 0) {
    tips.push('The yellow words are close — try articulating more clearly.');
  }
  if (stats.missedCount > 0) {
    tips.push('Try to read every word; skip less next time.');
  }
  return tips;
}

function buildFallbackResult(
  stats: FeedbackStats,
  accuracy: number,
  redWords: string[],
  intonation: string,
): FeedbackResult {
  return {
    summary: `You read at ${stats.wpm} WPM with ${accuracy.toFixed(0)}% accuracy.`,
    tips: buildFallbackTips(stats),
    focusWords: redWords,
    nextSteps: [],
    speed: getSpeedLabel(stats.wpm),
    clarity: getClarityLabel(accuracy),
    intonation,
  };
}

function sanitizeAiResult(
  data: FeedbackResult,
  stats: FeedbackStats,
  accuracy: number,
  redWords: string[],
): FeedbackResult {
  const focusWords = Array.isArray(data.focusWords)
    ? data.focusWords
    : redWords.slice(0, 8);
  const tips = Array.isArray(data.tips) ? data.tips : [];
  const nextSteps = Array.isArray(data.nextSteps) ? data.nextSteps : [];
  return {
    ...data,
    focusWords,
    tips,
    nextSteps,
    speed: data.speed ?? getSpeedLabel(stats.wpm),
    clarity: data.clarity ?? getClarityLabel(accuracy),
    intonation:
      data.intonation ?? 'natural overall with room for expressiveness',
  };
}

function logDebug(label: string, message: string): void {
  if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
    console.info(`[Reading][Feedback] ${label} ${message}`);
  }
}

export class OpenAIFeedbackService implements IFeedbackAIService {
  constructor(private readonly apiKey: string) {}

  async generateFeedback(stats: FeedbackStats): Promise<FeedbackResult> {
    const overallStart = Date.now();
    const total =
      stats.greenCount + stats.yellowCount + stats.redCount + stats.missedCount;
    const accuracy = total > 0 ? (stats.greenCount / total) * 100 : 0;
    const redWords = getRedWords(stats, 8);

    if (!this.apiKey) {
      logDebug(
        'Using fallback feedback (no API key). Completed in',
        `${Date.now() - overallStart}ms`,
      );
      return buildFallbackResult(
        stats,
        accuracy,
        redWords,
        'not evaluated (AI feedback disabled)',
      );
    }

    const redWordsForPrompt = getRedWords(stats, 10);
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
    logDebug(
      'OpenAI gpt-4o-mini completed in',
      `${Date.now() - openAiStart}ms (level=${stats.level}, wpm=${stats.wpm})`,
    );

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

    const result = sanitizeAiResult(data, stats, accuracy, redWords);
    logDebug(
      'generateFeedback total',
      `${Date.now() - overallStart}ms (tips=${result.tips.length}, focusWords=${result.focusWords.length})`,
    );
    return result;
  }
}
