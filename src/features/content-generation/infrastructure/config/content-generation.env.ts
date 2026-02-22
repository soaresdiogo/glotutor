/**
 * Content generation config from environment.
 * Switch provider/model via .env — no code change required.
 *
 * .env:
 *   CONTENT_GENERATION_PROVIDER=openai   # or "gemini"
 *   CONTENT_GENERATION_MODEL=gpt-4o-mini # or gemini-1.5-pro, etc.
 *   OPENAI_API_KEY=sk-...                # when provider=openai
 *   GEMINI_API_KEY=...                   # when provider=gemini
 */

export type ContentGenerationProvider = 'openai' | 'gemini';

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
// Equivalent to gpt-4o-mini: Flash tier, good quality/cost. 2.5 has 65k output (safe for lesson JSON); 2.0-flash has 8k output and may truncate.
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export interface ContentGenerationConfig {
  provider: ContentGenerationProvider;
  apiKey: string;
  model: string;
}

export function getContentGenerationConfig(): ContentGenerationConfig {
  const raw = process.env.CONTENT_GENERATION_PROVIDER?.toLowerCase();
  const provider: ContentGenerationProvider =
    raw === 'gemini' ? 'gemini' : 'openai';

  const apiKey =
    provider === 'gemini'
      ? process.env.GEMINI_API_KEY?.trim()
      : process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    const keyName = provider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
    throw new Error(
      `Content generation is set to "${provider}" but ${keyName} is missing. Set it in .env (or use CONTENT_GENERATION_PROVIDER=openai and OPENAI_API_KEY).`,
    );
  }

  const model =
    process.env.CONTENT_GENERATION_MODEL?.trim() ??
    (provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL);

  return { provider, apiKey, model };
}
