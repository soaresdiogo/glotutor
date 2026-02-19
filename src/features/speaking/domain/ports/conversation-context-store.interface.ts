export type TutorResponseStructured = {
  reply: string;
  correction: string;
  explanation: string;
  next_question: string;
};

export type ConversationContextMessage = {
  role: 'user' | 'assistant';
  content: string;
  /** Parsed structured fields (only for assistant messages). Used for feedback. */
  structured?: TutorResponseStructured;
};

export type ConversationContext = {
  summary?: string;
  messages: ConversationContextMessage[];
  turnCount: number;
};

const MAX_MESSAGE_PAIRS = 3;

/**
 * Store for conversation context per session (last N message pairs + optional summary).
 * Implemented with Redis for the speaking message pipeline.
 */
export interface IConversationContextStore {
  get(sessionId: string): Promise<ConversationContext | null>;
  set(
    sessionId: string,
    context: ConversationContext,
    ttlSeconds: number,
  ): Promise<void>;
  /**
   * Append one user/assistant pair and trim to last MAX_MESSAGE_PAIRS (6 messages).
   * @param options.structured - Optional structured tutor response (for assistant message).
   */
  appendAndTrim(
    sessionId: string,
    userContent: string,
    assistantContent: string,
    ttlSeconds: number,
    options?: { structured?: TutorResponseStructured },
  ): Promise<void>;
}

export { MAX_MESSAGE_PAIRS };
