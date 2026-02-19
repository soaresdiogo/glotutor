import OpenAI from 'openai';
import type {
  IReadingEvaluationService,
  WordEvaluationStatus,
} from '@/features/reading/domain/ports/reading-evaluation-service.interface';

const VALID_STATUSES = new Set<WordEvaluationStatus>([
  'green',
  'yellow',
  'red',
  'missed',
]);

export class OpenAIReadingEvaluationService
  implements IReadingEvaluationService
{
  constructor(private readonly apiKey: string) {}

  async evaluateWordStatuses(
    expectedWords: string[],
    actualTranscript: string,
    languageCode: string,
  ): Promise<WordEvaluationStatus[]> {
    if (!this.apiKey || expectedWords.length === 0) {
      return [];
    }

    const lang = languageCode.split('-')[0];

    const openai = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a strict language tutor evaluating pronunciation. Judge each word: green = clearly correct, yellow = almost correct, red = wrong/unclear, missed = not said. Reply with ONLY a JSON array of exactly ${expectedWords.length} strings: ["green","yellow","red","missed",...]. No other text.`,
        },
        {
          role: 'user',
          content: `Language: ${lang}\n\nEXPECTED (${expectedWords.length} words): ${expectedWords.join(' | ')}\n\nACTUAL: ${actualTranscript}\n\nJSON array:`,
        },
      ],
      temperature: 0.1,
      max_tokens: Math.min(1000, expectedWords.length * 3),
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return [];

    try {
      const parsed = content.startsWith('[') ? content : JSON.parse(content);
      const arr = Array.isArray(parsed)
        ? parsed
        : (parsed.statuses ?? parsed.result ?? []);
      const statuses = arr.slice(0, expectedWords.length).map((s: unknown) => {
        const v = String(s).toLowerCase() as WordEvaluationStatus;
        return VALID_STATUSES.has(v) ? v : 'red';
      });
      while (statuses.length < expectedWords.length) statuses.push('red');
      return statuses;
    } catch {
      return [];
    }
  }
}
