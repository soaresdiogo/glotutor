import OpenAI from 'openai';

import type {
  ITTSGateway,
  TTSSynthesizeOptions,
} from '@/features/listening/domain/ports/tts-gateway.interface';

const OPENAI_VOICES = [
  'alloy',
  'echo',
  'fable',
  'nova',
  'onyx',
  'shimmer',
] as const;

export class OpenAITTSGateway implements ITTSGateway {
  constructor(private readonly apiKey: string) {}

  async synthesize(params: TTSSynthesizeOptions): Promise<Uint8Array> {
    if (!this.apiKey) throw new Error('OpenAI API key not configured');
    const openai = new OpenAI({ apiKey: this.apiKey });
    const voice = OPENAI_VOICES.includes(
      params.voice as (typeof OPENAI_VOICES)[number],
    )
      ? params.voice
      : 'nova';
    const speed = params.speed ?? 1;
    const model = params.model ?? 'tts-1-hd';
    const response = await openai.audio.speech.create({
      model,
      input: params.text,
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      response_format: 'mp3',
      speed: Math.min(4, Math.max(0.25, speed)),
    });
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
}
