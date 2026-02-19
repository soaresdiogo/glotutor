import OpenAI from 'openai';

import type {
  IWordDetailsService,
  WordDetailsResult,
} from '@/features/reading/domain/ports/word-details-service.interface';

export class OpenAIWordDetailsService implements IWordDetailsService {
  constructor(private readonly apiKey: string) {}

  async getWordDetails(
    word: string,
    textLanguageCode: string,
    nativeLanguageCode: string,
  ): Promise<WordDetailsResult> {
    if (!this.apiKey) {
      return { phoneticIpa: null, definition: null };
    }

    const openai = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a language learning assistant. For a single word, return a JSON object with exactly two keys: "phoneticIpa" (IPA string for the word in the given language, or null if not applicable) and "definition" (a very short translation or definition in the student's native language, one phrase or one word only, or null). Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Word: "${word}". Word is in language code: ${textLanguageCode}. Translate/define it for a student whose native language code is: ${nativeLanguageCode}. Return JSON: { "phoneticIpa": "...", "definition": "..." }.`,
        },
      ],
      max_tokens: 150,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return { phoneticIpa: null, definition: null };
    }

    let phoneticIpa: string | null = null;
    let definition: string | null = null;
    try {
      const parsed = JSON.parse(raw) as {
        phoneticIpa?: string | null;
        definition?: string | null;
      };
      phoneticIpa =
        typeof parsed.phoneticIpa === 'string' ? parsed.phoneticIpa : null;
      definition =
        typeof parsed.definition === 'string' ? parsed.definition : null;
    } catch {
      // Model returned non-JSON
    }
    return { phoneticIpa, definition };
  }
}
