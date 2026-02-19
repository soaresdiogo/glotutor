import type { SpeakingFeedbackEntity } from '../entities/speaking-session.entity';

export type ConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export interface ISpeakingFeedbackAIGateway {
  generateFeedback(params: {
    transcript: ConversationTurn[];
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
    topicTitle: string;
  }): Promise<SpeakingFeedbackEntity>;
}
