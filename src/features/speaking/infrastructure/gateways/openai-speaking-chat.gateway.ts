import OpenAI from 'openai';

import type {
  ISpeakingChatGateway,
  SpeakingChatUsage,
} from '@/features/speaking/domain/ports/speaking-chat-gateway.interface';

const MODEL = 'gpt-4o-mini';

export class OpenAISpeakingChatGateway implements ISpeakingChatGateway {
  constructor(private readonly apiKey: string) {}

  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ): Promise<{ content: string; usage?: SpeakingChatUsage }> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    const openai = new OpenAI({ apiKey: this.apiKey });
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 300,
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content?.trim() ?? '';
    const usage: SpeakingChatUsage | undefined = completion.usage
      ? {
          inputTokens: completion.usage.prompt_tokens ?? 0,
          outputTokens: completion.usage.completion_tokens ?? 0,
        }
      : undefined;
    return { content, usage };
  }
}
