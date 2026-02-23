import OpenAI from 'openai';

import type { GrammarItemEntity } from '@/features/reading/domain/entities/reading-session.entity';
import type { IGrammarAnalysisService } from '@/features/reading/domain/ports/grammar-analysis-service.interface';

export class OpenAIGrammarService implements IGrammarAnalysisService {
  private readonly cache = new Map<string, GrammarItemEntity[]>();
  private readonly maxTextLength: number;
  private readonly maxItems: number;
  private readonly cacheEnabled: boolean;

  constructor(private readonly apiKey: string) {
    this.maxTextLength = Number.parseInt(
      process.env.GRAMMAR_MAX_TEXT_LENGTH || '600',
      10,
    );
    this.maxItems = Number.parseInt(process.env.GRAMMAR_MAX_ITEMS || '5', 10);
    this.cacheEnabled = process.env.GRAMMAR_CACHE_ENABLED !== 'false';
  }

  async analyze(input: {
    textId?: string;
    textContent: string;
    studentLevel: string;
    nativeLanguage: string;
  }): Promise<GrammarItemEntity[]> {
    const overallStart = Date.now();

    if (!this.apiKey) {
      if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
        console.info('[Grammar] No API key');
      }
      return [];
    }

    const cacheKey = input.textId
      ? `${input.textId}-${input.studentLevel}-${input.nativeLanguage}`
      : null;

    const cached = this.getCached(cacheKey, overallStart);
    if (cached !== null) return cached;

    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      console.info('[Grammar] ⚠️ Cache MISS, calling OpenAI...');
    }

    const truncatedText =
      input.textContent.length > this.maxTextLength
        ? `${input.textContent.substring(0, this.maxTextLength)}...`
        : input.textContent;

    const limited = await this.callOpenAIAndParse(
      input.studentLevel,
      truncatedText,
      input.textContent.length,
      truncatedText.length,
      overallStart,
    );

    if (this.cacheEnabled && cacheKey && limited.length > 0) {
      this.cache.set(cacheKey, limited);
    }

    const duration = Date.now() - overallStart;
    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      console.info(
        `[Grammar] analyze total ${duration}ms (items=${limited.length})`,
      );
    }

    return limited;
  }

  private getCached(
    cacheKey: string | null,
    overallStart: number,
  ): GrammarItemEntity[] | null {
    if (!this.cacheEnabled || !cacheKey) return null;
    const cached = this.cache.get(cacheKey);
    if (cached === undefined) return null;
    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      const duration = Date.now() - overallStart;
      console.info(`[Grammar] ✅ Cache HIT in ${duration}ms`);
    }
    return cached;
  }

  private async callOpenAIAndParse(
    studentLevel: string,
    truncatedText: string,
    originalLength: number,
    truncatedLength: number,
    overallStart: number,
  ): Promise<GrammarItemEntity[]> {
    const systemPrompt = `You are a grammar teacher. Find 3-5 key grammar patterns in ${studentLevel} level text.

Return ONLY JSON array (no markdown):
[{"sentence":"example","structure":"tense name","explanation":"brief","pattern":"formula","level":"${studentLevel}"}]

Keep explanations under 15 words. Max 5 items.`;

    const userPrompt = `Text: "${truncatedText}"`;

    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      console.log('[Grammar] System prompt:', systemPrompt.length, 'chars');
      console.log('[Grammar] User prompt:', userPrompt.length, 'chars');
      console.log(
        '[Grammar] Text truncated:',
        originalLength,
        '→',
        truncatedLength,
      );
    }

    const openai = new OpenAI({ apiKey: this.apiKey });
    const openAiStart = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    const openAiDuration = Date.now() - openAiStart;

    if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
      console.info(
        '[Grammar] OpenAI gpt-4o-mini completed in',
        openAiDuration,
        'ms',
      );
      console.info('[Grammar] Tokens used:', completion.usage);
    }

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

    try {
      const parsed = JSON.parse(cleaned) as GrammarItemEntity[];
      return parsed.slice(0, this.maxItems);
    } catch (error) {
      if (process.env.DEBUG_READING_TRANSCRIPT === '1') {
        const duration = Date.now() - overallStart;
        console.warn(`[Grammar] Failed to parse after ${duration}ms`, error);
        console.warn('[Grammar] Raw response:', raw.substring(0, 200));
      }
      return [];
    }
  }
}
