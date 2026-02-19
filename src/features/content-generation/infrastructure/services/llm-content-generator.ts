import OpenAI from 'openai';
import type { IContentGeneratorPort } from '@/features/content-generation/domain/ports/content-generator.interface';
import type {
  ComposedPrompt,
  ContentPass,
} from '@/features/content-generation/domain/types/generation-request.types';
import { generateLessonInSubPasses } from './lesson-multi-pass-generator';

const DEFAULT_MODEL = 'gpt-4o';
const MAX_TOKENS = 16384;

/**
 * Calls OpenAI with composed prompt and returns raw JSON string.
 * Lesson pass uses sub-pass strategy to avoid truncation.
 */
export class LLMContentGenerator implements IContentGeneratorPort {
  constructor(private readonly apiKey: string) {}

  async generate(
    prompt: ComposedPrompt,
    pass: ContentPass,
    options?: { cefrLevel?: string },
  ): Promise<string> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');

    if (pass === 'lesson') {
      return generateLessonInSubPasses(this.apiKey, prompt, options?.cefrLevel);
    }

    const openai = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.CONTENT_GENERATION_MODEL ?? DEFAULT_MODEL,
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: prompt.userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty LLM response');
    return raw;
  }
}
