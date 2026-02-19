/**
 * OpenAI pricing per 1M tokens (input / output). Internal analytics only.
 * Update from https://openai.com/api/pricing/ when needed.
 */
const PRICE_PER_MILLION = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
} as const;

export type OpenAICostModel = keyof typeof PRICE_PER_MILLION;

export function calculateOpenAICost(params: {
  inputTokens: number;
  outputTokens: number;
  model: OpenAICostModel;
}): number {
  const prices = PRICE_PER_MILLION[params.model];
  if (!prices) return 0;
  const inputCost = (params.inputTokens / 1_000_000) * prices.input;
  const outputCost = (params.outputTokens / 1_000_000) * prices.output;
  return Math.round((inputCost + outputCost) * 1e8) / 1e8;
}
