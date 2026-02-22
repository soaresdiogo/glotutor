import type { SpeakingSessionEntity } from '@/features/speaking/domain/entities/speaking-session.entity';
import type {
  IConversationContextStore,
  TutorResponseStructured,
} from '@/features/speaking/domain/ports/conversation-context-store.interface';
import type { ISpeakingChatGateway } from '@/features/speaking/domain/ports/speaking-chat-gateway.interface';
import type { ISpeakingSessionUsageStore } from '@/features/speaking/domain/ports/speaking-session-usage-store.interface';
import type { ISpeechToTextGateway } from '@/features/speaking/domain/ports/speech-to-text-gateway.interface';
import type { ITextToSpeechGateway } from '@/features/speaking/domain/ports/text-to-speech-gateway.interface';
import type { ISpeakingSessionRepository } from '@/features/speaking/domain/repositories/speaking-session-repository.interface';
import type { ISpeakingSessionUsageRepository } from '@/features/speaking/domain/repositories/speaking-session-usage-repository.interface';
import type { ISpeakingTopicRepository } from '@/features/speaking/domain/repositories/speaking-topic-repository.interface';
import type { IStudentProfileProvider } from '@/features/student-profile/domain/ports/student-profile-provider.interface';
import { NotFoundError } from '@/shared/lib/errors';
import { buildSpeakingSystemPrompt } from '../build-speaking-system-prompt';
import { calculateOpenAICost } from '../constants/openai-cost';
import { getMaxTurnsForCefrLevel } from '../constants/speaking-session-limits';

export type SendSpeakingMessageInput = {
  userId: string;
  sessionId: string;
  isStart?: boolean;
  audioBuffer?: Buffer;
  mimeType?: string;
};

export type SendSpeakingMessageResult = {
  studentText: string;
  tutorText: string;
  tutorAudio: string;
  isSessionExpired: boolean;
  turnInfo: { current: number; max: number };
  correction?: { correction: string; explanation: string };
};

const CONTEXT_TTL_SECONDS = 60 * 15; // 15 min

/** Tries to extract a single JSON object from a string (e.g. when LLM wraps or prefixes the JSON). */
function extractJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function parseTutorResponse(raw: string): {
  tutorText: string;
  structured?: TutorResponseStructured;
} {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: TutorResponseStructured | null = null;
  try {
    parsed = JSON.parse(cleaned) as TutorResponseStructured;
  } catch {
    const jsonSlice = extractJsonObject(cleaned);
    if (jsonSlice) {
      try {
        parsed = JSON.parse(jsonSlice) as TutorResponseStructured;
      } catch {
        // fall through to raw
      }
    }
  }

  if (parsed && typeof parsed.reply === 'string') {
    const parts = [
      parsed.reply,
      parsed.correction?.trim() || null,
      parsed.explanation?.trim() || null,
      parsed.next_question?.trim() || null,
    ].filter(Boolean) as string[];
    const tutorText = parts.join('\n');
    return { tutorText, structured: parsed };
  }

  return { tutorText: raw };
}

export class SendSpeakingMessageUseCase {
  constructor(
    private readonly sessionRepo: ISpeakingSessionRepository,
    private readonly topicRepo: ISpeakingTopicRepository,
    private readonly profileProvider: IStudentProfileProvider,
    private readonly sttGateway: ISpeechToTextGateway,
    private readonly ttsGateway: ITextToSpeechGateway,
    private readonly chatGateway: ISpeakingChatGateway,
    private readonly contextStore: IConversationContextStore,
    private readonly usageStore: ISpeakingSessionUsageStore,
    private readonly usageRepo: ISpeakingSessionUsageRepository,
  ) {}

  private async getSessionAndTopic(input: SendSpeakingMessageInput) {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) {
      throw new NotFoundError(
        'Speaking session not found.',
        'speaking.sessionNotFound',
      );
    }
    if (session.userId !== input.userId) {
      throw new NotFoundError(
        'Speaking session not found.',
        'speaking.sessionNotFound',
      );
    }
    if (session.status !== 'in_progress') {
      throw new NotFoundError(
        'Session is not active.',
        'speaking.sessionNotActive',
      );
    }
    const topic = await this.topicRepo.findById(session.topicId);
    if (!topic) {
      throw new NotFoundError('Topic not found.', 'speaking.topicNotFound');
    }
    return { session, topic };
  }

  private async persistUsageAndLog(
    sessionId: string,
    userId: string,
    session: SpeakingSessionEntity,
  ): Promise<void> {
    const usage = await this.usageStore.get(sessionId);
    if (
      !usage ||
      (usage.totalTurns === 0 &&
        usage.totalInputTokens === 0 &&
        usage.totalOutputTokens === 0)
    ) {
      return;
    }
    const durationSeconds = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );
    const estimatedCostUsd = calculateOpenAICost({
      inputTokens: usage.totalInputTokens,
      outputTokens: usage.totalOutputTokens,
      model: 'gpt-4o-mini',
    });
    try {
      await this.usageRepo.create({
        sessionId,
        userId,
        totalTurns: usage.totalTurns,
        totalInputTokens: usage.totalInputTokens,
        totalOutputTokens: usage.totalOutputTokens,
        estimatedCostUsd,
        durationSeconds,
      });
      console.info(
        '[Speaking][Usage]',
        `sessionId=${sessionId} turns=${usage.totalTurns} inputTokens=${usage.totalInputTokens} outputTokens=${usage.totalOutputTokens} estimatedCost=${estimatedCostUsd} durationSeconds=${durationSeconds}`,
      );
    } catch (e) {
      console.warn('[Speaking][Usage] Failed to persist usage:', e);
    }
  }

  /**
   * Resolves TTS locale (e.g. en-US, pt-BR, pt-PT) from topic.
   * Supports full locale for regional variants; defaults: en -> en-US, pt -> pt-BR.
   */
  private resolveTtsLanguage(topic: { languageCode?: string | null }): string {
    const raw = (topic.languageCode ?? 'en').trim();
    if (!raw) return 'en-US';
    if (raw.startsWith('en')) return raw.length > 2 ? raw : 'en-US';
    return raw;
  }

  private async returnGoodbyeMaxTurns(
    input: SendSpeakingMessageInput,
    session: SpeakingSessionEntity,
    ttsLanguage: string,
    turnCount: number,
    maxTurns: number,
  ): Promise<SendSpeakingMessageResult> {
    await this.persistUsageAndLog(input.sessionId, input.userId, session);
    const goodbyeText =
      "We've had a great conversation! Let's wrap up and review your feedback.";
    const goodbyeAudio = await this.ttsGateway.synthesize(
      goodbyeText,
      ttsLanguage,
    );
    return {
      studentText: '',
      tutorText: goodbyeText,
      tutorAudio: Buffer.from(goodbyeAudio).toString('base64'),
      isSessionExpired: true,
      turnInfo: { current: turnCount, max: maxTurns },
    };
  }

  private async returnGoodbyeExpired(
    input: SendSpeakingMessageInput,
    session: SpeakingSessionEntity,
    ttsLanguage: string,
    turnCount: number,
    maxTurns: number,
  ): Promise<SendSpeakingMessageResult> {
    await this.persistUsageAndLog(input.sessionId, input.userId, session);
    const goodbyeText =
      "Time's up for today! You did great. We'll review your conversation and give you feedback in a moment.";
    const goodbyeAudio = await this.ttsGateway.synthesize(
      goodbyeText,
      ttsLanguage,
    );
    return {
      studentText: '',
      tutorText: goodbyeText,
      tutorAudio: Buffer.from(goodbyeAudio).toString('base64'),
      isSessionExpired: true,
      turnInfo: { current: turnCount, max: maxTurns },
    };
  }

  private buildCorrectionPayload(
    structured: TutorResponseStructured | undefined,
  ): {
    correction?: { correction: string; explanation: string };
  } {
    if (!structured?.correction) return {};
    return {
      correction: {
        correction: structured.correction,
        explanation: structured.explanation ?? '',
      },
    };
  }

  private async sendUserMessageAndReturnResult(opts: {
    input: SendSpeakingMessageInput;
    topic: { languageCode?: string | null };
    context: Awaited<ReturnType<IConversationContextStore['get']>>;
    systemPrompt: string;
    ttsLanguage: string;
    maxTurns: number;
    audioBuffer: Buffer;
    mimeType: string;
  }): Promise<SendSpeakingMessageResult> {
    const {
      input,
      topic,
      context,
      systemPrompt,
      ttsLanguage,
      maxTurns,
      audioBuffer,
      mimeType,
    } = opts;
    const targetLanguage = topic.languageCode ?? 'en';
    const studentText = await this.sttGateway.transcribe(
      audioBuffer,
      mimeType,
      targetLanguage,
    );
    const contextMessages = (context?.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const summaryPart = context?.summary
      ? `\n\nPrevious context: ${context.summary}\n\n`
      : '';
    const messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [
      { role: 'system', content: systemPrompt + summaryPart },
      ...contextMessages,
      { role: 'user', content: studentText || '(no speech recognized)' },
    ];
    const chatResult = await this.chatGateway.chat(messages);
    if (chatResult.usage) {
      await this.usageStore.increment(
        input.sessionId,
        chatResult.usage.inputTokens,
        chatResult.usage.outputTokens,
        CONTEXT_TTL_SECONDS,
      );
    }
    const { tutorText, structured } = parseTutorResponse(chatResult.content);
    const tutorAudio = await this.ttsGateway.synthesize(tutorText, ttsLanguage);
    await this.contextStore.appendAndTrim(
      input.sessionId,
      studentText || '(no speech recognized)',
      tutorText,
      CONTEXT_TTL_SECONDS,
      { structured },
    );
    const newTurnCount = (context?.turnCount ?? 0) + 1;
    return {
      studentText,
      tutorText,
      tutorAudio: Buffer.from(tutorAudio).toString('base64'),
      isSessionExpired: false,
      turnInfo: { current: newTurnCount, max: maxTurns },
      ...this.buildCorrectionPayload(structured),
    };
  }

  private async returnGreeting(
    input: SendSpeakingMessageInput,
    systemPrompt: string,
    ttsLanguage: string,
    maxTurns: number,
  ): Promise<SendSpeakingMessageResult> {
    const greetingMessages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content:
          "[SESSION_START] The student just joined the class. Greet them and introduce today's topic.",
      },
    ];
    const greetingResult = await this.chatGateway.chat(greetingMessages);
    if (greetingResult.usage) {
      await this.usageStore.increment(
        input.sessionId,
        greetingResult.usage.inputTokens,
        greetingResult.usage.outputTokens,
        CONTEXT_TTL_SECONDS,
        { addTurn: false },
      );
    }
    const { tutorText: greetingText } = parseTutorResponse(
      greetingResult.content,
    );
    const tutorAudio = await this.ttsGateway.synthesize(
      greetingText,
      ttsLanguage,
    );
    return {
      studentText: '',
      tutorText: greetingText,
      tutorAudio: Buffer.from(tutorAudio).toString('base64'),
      isSessionExpired: false,
      turnInfo: { current: 0, max: maxTurns },
    };
  }

  async execute(
    input: SendSpeakingMessageInput,
  ): Promise<SendSpeakingMessageResult> {
    const { session, topic } = await this.getSessionAndTopic(input);
    const elapsed = Date.now() - session.startedAt.getTime();
    const maxDurationMs = session.durationSeconds * 1000;
    const isExpired = elapsed > maxDurationMs;
    const ttsLanguage = this.resolveTtsLanguage(topic);
    const maxTurns = getMaxTurnsForCefrLevel(topic.cefrLevel);
    const context = await this.contextStore.get(input.sessionId);

    if (!input.isStart && context != null && context.turnCount >= maxTurns) {
      return this.returnGoodbyeMaxTurns(
        input,
        session,
        ttsLanguage,
        context.turnCount,
        maxTurns,
      );
    }

    const profile = await this.profileProvider.getProfile(input.userId);
    const nativeLanguage = profile?.nativeLanguageCode ?? 'en';
    const systemPrompt = buildSpeakingSystemPrompt({
      targetLanguage: topic.languageCode ?? 'en',
      nativeLanguage,
      cefrLevel: topic.cefrLevel,
      topicTitle: topic.title,
      contextPrompt: topic.contextPrompt,
      keyVocabulary: topic.keyVocabulary,
      nativeExpressions: topic.nativeExpressions,
    });

    if (isExpired) {
      return this.returnGoodbyeExpired(
        input,
        session,
        ttsLanguage,
        context?.turnCount ?? 0,
        maxTurns,
      );
    }

    if (input.isStart) {
      return this.returnGreeting(input, systemPrompt, ttsLanguage, maxTurns);
    }

    const { audioBuffer, mimeType } = input;
    if (!audioBuffer || !mimeType) {
      throw new Error('Audio is required for non-start message.');
    }

    return this.sendUserMessageAndReturnResult({
      input,
      topic,
      context,
      systemPrompt,
      ttsLanguage,
      maxTurns,
      audioBuffer,
      mimeType,
    });
  }
}
