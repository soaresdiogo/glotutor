import { env } from '@/env';
import { AzureSpeechPronunciationService } from '@/features/reading/infrastructure/services/azure-speech-pronunciation.service';
import { SendSpeakingMessageUseCase } from '@/features/speaking/application/use-cases/send-speaking-message.use-case';
import { SpeakingSessionRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session.repository';
import { SpeakingSessionUsageRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-session-usage.repository';
import { SpeakingTopicRepository } from '@/features/speaking/infrastructure/drizzle-repositories/speaking-topic.repository';
import { AzureTextToSpeechGateway } from '@/features/speaking/infrastructure/gateways/azure-text-to-speech.gateway';
import { OpenAISpeakingChatGateway } from '@/features/speaking/infrastructure/gateways/openai-speaking-chat.gateway';
import { TranscriptionToSpeechToTextAdapter } from '@/features/speaking/infrastructure/gateways/transcription-to-speech-to-text.adapter';
import { InMemoryConversationContextStore } from '@/features/speaking/infrastructure/stores/in-memory-conversation-context.store';
import { InMemorySpeakingSessionUsageStore } from '@/features/speaking/infrastructure/stores/in-memory-speaking-session-usage.store';
import { RedisConversationContextStore } from '@/features/speaking/infrastructure/stores/redis-conversation-context.store';
import { RedisSpeakingSessionUsageStore } from '@/features/speaking/infrastructure/stores/redis-speaking-session-usage.store';
import { ResilientConversationContextStore } from '@/features/speaking/infrastructure/stores/resilient-conversation-context.store';
import { ResilientSpeakingSessionUsageStore } from '@/features/speaking/infrastructure/stores/resilient-speaking-session-usage.store';
import { StudentProfileProvider } from '@/features/student-profile/infrastructure/student-profile.provider';
import { db } from '@/infrastructure/db/client';

/**
 * Speaking uses Azure Speech for STT and TTS. Requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.
 */
export function makeSendSpeakingMessageUseCase(): SendSpeakingMessageUseCase {
  const sessionRepo = new SpeakingSessionRepository(db);
  const topicRepo = new SpeakingTopicRepository(db);
  const profileProvider = new StudentProfileProvider();

  const azureKey = process.env.AZURE_SPEECH_KEY ?? '';
  const azureRegion = process.env.AZURE_SPEECH_REGION ?? '';
  const openaiKey = env.OPENAI_API_KEY ?? '';

  if (!azureKey || !azureRegion) {
    throw new Error(
      'Speaking (STT/TTS) requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.',
    );
  }

  const sttGateway = new TranscriptionToSpeechToTextAdapter(
    new AzureSpeechPronunciationService(azureKey, azureRegion),
  );

  const ttsGateway = new AzureTextToSpeechGateway({
    subscriptionKey: azureKey,
    region: azureRegion,
  });

  const chatGateway = new OpenAISpeakingChatGateway(openaiKey);
  const contextStore = new ResilientConversationContextStore(
    new RedisConversationContextStore(),
    new InMemoryConversationContextStore(),
  );

  const usageStore = new ResilientSpeakingSessionUsageStore(
    new RedisSpeakingSessionUsageStore(),
    new InMemorySpeakingSessionUsageStore(),
  );
  const usageRepo = new SpeakingSessionUsageRepository(db);

  return new SendSpeakingMessageUseCase(
    sessionRepo,
    topicRepo,
    profileProvider,
    sttGateway,
    ttsGateway,
    chatGateway,
    contextStore,
    usageStore,
    usageRepo,
  );
}
