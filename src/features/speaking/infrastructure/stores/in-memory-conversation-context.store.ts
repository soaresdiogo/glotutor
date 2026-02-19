import type {
  ConversationContext,
  ConversationContextMessage,
  IConversationContextStore,
  TutorResponseStructured,
} from '@/features/speaking/domain/ports/conversation-context-store.interface';
import { MAX_MESSAGE_PAIRS } from '@/features/speaking/domain/ports/conversation-context-store.interface';

const _MAX_ENTRY_AGE_MS = 20 * 60 * 1000; // 20 minutes

type Entry = { context: ConversationContext; expiresAt: number };

/**
 * In-memory fallback for conversation context when Redis is unavailable.
 * Not for production scale — entries are dropped after 20 minutes to prevent memory leaks.
 */
export class InMemoryConversationContextStore
  implements IConversationContextStore
{
  private readonly store = new Map<string, Entry>();

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  async get(sessionId: string): Promise<ConversationContext | null> {
    this.cleanExpired();
    const entry = this.store.get(sessionId);
    if (!entry || entry.expiresAt < Date.now()) {
      if (entry) this.store.delete(sessionId);
      return null;
    }
    return entry.context;
  }

  async set(
    sessionId: string,
    context: ConversationContext,
    ttlSeconds: number,
  ): Promise<void> {
    this.cleanExpired();
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(sessionId, { context, expiresAt });
  }

  async appendAndTrim(
    sessionId: string,
    userContent: string,
    assistantContent: string,
    ttlSeconds: number,
    options?: { structured?: TutorResponseStructured },
  ): Promise<void> {
    this.cleanExpired();
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
