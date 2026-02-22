import OpenAI from 'openai';
import type { IContentGeneratorPort } from '@/features/content-generation/domain/ports/content-generator.interface';
import type {
  ComposedPrompt,
  ContentPass,
} from '@/features/content-generation/domain/types/generation-request.types';
import { generateLessonInSubPasses } from './lesson-multi-pass-generator';

const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 16384;
const MAX_TOKENS_LESSON_PATCH = 8192;

/**
 * Calls OpenAI with composed prompt and returns raw JSON string.
 * Lesson pass uses sub-pass strategy (A + B1 + B2) to avoid truncation.
 * When options.isLessonPatch is true, lesson uses a single completion (for patch fixes only).
 * Model can be set via constructor (from env) or env CONTENT_GENERATION_MODEL.
 */
export class LLMContentGenerator implements IContentGeneratorPort {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.CONTENT_GENERATION_MODEL ??
      DEFAULT_MODEL,
  ) {}

  async generate(
    prompt: ComposedPrompt,
    pass: ContentPass,
    options?: {
      cefrLevel?: string;
      isLessonPatch?: boolean;
      targetLanguage?: string;
      nativeLanguage?: string;
    },
  ): Promise<string> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');

    if (pass === 'lesson' && options?.isLessonPatch === true) {
      return this.generateSingle(prompt, pass, MAX_TOKENS_LESSON_PATCH);
    }

    if (pass === 'lesson') {
      return generateLessonInSubPasses(
        this.apiKey,
        prompt,
        options?.cefrLevel,
        this.model,
        {
          targetLanguage: options?.targetLanguage,
          nativeLanguage: options?.nativeLanguage,
        },
      );
    }

    return this.generateSingle(prompt, pass, MAX_TOKENS);
  }

  private async generateSingle(
    prompt: ComposedPrompt,
    pass: ContentPass,
    maxTokens: number,
  ): Promise<string> {
    const openai = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: prompt.userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    if (process.env.LOG_TOKEN_USAGE === '1' && completion.usage) {
      const u = completion.usage;
      console.log(
        `[tokens] ${pass}: prompt=${u.prompt_tokens} completion=${u.completion_tokens} total=${u.total_tokens}`,
      );
    }

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty LLM response');
    return raw;
  }
}
