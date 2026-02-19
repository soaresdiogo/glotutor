import type {
  ConversationContext,
  IConversationContextStore,
  TutorResponseStructured,
} from '@/features/speaking/domain/ports/conversation-context-store.interface';

const FALLBACK_WARNING =
  '[Speaking] Redis conversation context unavailable, using in-memory fallback';

/**
 * Wraps a primary (Redis) and fallback (in-memory) context store.
 * On primary failure, uses fallback and logs a warning for Redis health monitoring.
 */
export class ResilientConversationContextStore
  implements IConversationContextStore
{
  constructor(
    private readonly primary: IConversationContextStore,
    private readonly fallback: IConversationContextStore,
  ) {}

  async get(sessionId: string): Promise<ConversationContext | null> {
    try {
      return await this.primary.get(sessionId);
    } catch {
      console.warn(FALLBACK_WARNING);
      return await this.fallback.get(sessionId);
    }
  }

  async set(
    sessionId: string,
    context: ConversationContext,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      await this.primary.set(sessionId, context, ttlSeconds);
    } catch {
      console.warn(FALLBACK_WARNING);
      await this.fallback.set(sessionId, context, ttlSeconds);
    }
  }

  async appendAndTrim(
    sessionId: string,
    userContent: string,
    assistantContent: string,
    ttlSeconds: number,
    options?: { structured?: TutorResponseStructured },
  ): Promise<void> {
    try {
      await this.primary.appendAndTrim(
        sessionId,
        userContent,
        assistantContent,
        ttlSeconds,
        options,
      );
    } catch {
      console.warn(FALLBACK_WARNING);
      await this.fallback.appendAndTrim(
        sessionId,
        userContent,
        assistantContent,
        ttlSeconds,
        options,
      );
    }
  }
}
