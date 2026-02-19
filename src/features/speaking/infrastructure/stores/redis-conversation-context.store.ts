import type {
  ConversationContext,
  ConversationContextMessage,
  IConversationContextStore,
  TutorResponseStructured,
} from '@/features/speaking/domain/ports/conversation-context-store.interface';
import { MAX_MESSAGE_PAIRS } from '@/features/speaking/domain/ports/conversation-context-store.interface';
import { redisGet, redisSet } from '@/shared/lib/reading/redis-client';

const KEY_PREFIX = 'speaking:session:';
const KEY_SUFFIX = ':context';

function key(sessionId: string): string {
  return `${KEY_PREFIX}${sessionId}${KEY_SUFFIX}`;
}

export class RedisConversationContextStore
  implements IConversationContextStore
{
  async get(sessionId: string): Promise<ConversationContext | null> {
    const raw = await redisGet(key(sessionId));
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as {
        summary?: string;
        messages?: Array<{
          role: string;
          content: string;
          structured?: TutorResponseStructured;
        }>;
        turnCount?: number;
      };
      const messages: ConversationContextMessage[] = (data.messages ?? []).map(
        (m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content ?? '',
          ...(m.structured ? { structured: m.structured } : {}),
        }),
      );
      return {
        summary: data.summary,
        messages,
        turnCount: typeof data.turnCount === 'number' ? data.turnCount : 0,
      };
    } catch {
      return null;
    }
  }

  async set(
    sessionId: string,
    context: ConversationContext,
    ttlSeconds: number,
  ): Promise<void> {
    const value = JSON.stringify({
      summary: context.summary,
      messages: context.messages,
      turnCount: context.turnCount,
    });
    await redisSet(key(sessionId), value, ttlSeconds);
  }

  async appendAndTrim(
    sessionId: string,
    userContent: string,
    assistantContent: string,
    ttlSeconds: number,
    options?: { structured?: TutorResponseStructured },
  ): Promise<void> {
    const current = await this.get(sessionId);
    const assistantMessage: ConversationContextMessage = {
      role: 'assistant',
      content: assistantContent,
      ...(options?.structured ? { structured: options.structured } : {}),
    };
    const messages: ConversationContextMessage[] = [
      ...(current?.messages ?? []),
      { role: 'user', content: userContent },
      assistantMessage,
    ];
    const trimmed =
      messages.length > MAX_MESSAGE_PAIRS * 2
        ? messages.slice(-MAX_MESSAGE_PAIRS * 2)
        : messages;
    const turnCount = (current?.turnCount ?? 0) + 1;
    await this.set(
      sessionId,
      { summary: current?.summary, messages: trimmed, turnCount },
      ttlSeconds,
    );
  }
}
