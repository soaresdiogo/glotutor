export type SpeakingChatUsage = {
  inputTokens: number;
  outputTokens: number;
};

/**
 * Gateway for OpenAI (or other) chat completion used in the speaking conversation.
 */
export interface ISpeakingChatGateway {
  /**
   * Send messages and get the assistant's text response and optional token usage.
   */
  chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ): Promise<{ content: string; usage?: SpeakingChatUsage }>;
}
