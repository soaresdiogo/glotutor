import { OpenAITTSGateway } from '@/features/listening/infrastructure/gateways/openai-tts.gateway';
import type { ITextToSpeechGateway } from '@/features/speaking/domain/ports/text-to-speech-gateway.interface';

/**
 * Adapter that uses the existing OpenAI TTS gateway (listening feature)
 * for the speaking conversation when Azure TTS is not configured.
 */
export class OpenAITextToSpeechSpeakingAdapter implements ITextToSpeechGateway {
  constructor(private readonly apiKey: string) {}

  async synthesize(
    text: string,
    _languageCode: string,
    _options?: { voice?: string },
  ): Promise<Uint8Array> {
    const gateway = new OpenAITTSGateway(this.apiKey);
    return gateway.synthesize({
      text,
      voice: 'nova',
      model: 'tts-1-hd',
    });
  }
}
