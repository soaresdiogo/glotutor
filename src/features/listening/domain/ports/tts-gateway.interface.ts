export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'nova' | 'onyx' | 'shimmer';
export type TTSModel = 'tts-1' | 'tts-1-hd';

export interface TTSSynthesizeOptions {
  text: string;
  voice: TTSVoice;
  /** 0.25 to 4.0, default 1.0 */
  speed?: number;
  /** default tts-1-hd for quality */
  model?: TTSModel;
  /**
   * Optional locale for language-aware TTS (e.g. pt-BR, en-US, es-MX).
   * When set, gateways that support it (e.g. Azure) use a native neural voice for that locale
   * so the audio sounds like a native speaker with standard pronunciation.
   * Gateways that ignore it (e.g. OpenAI) will not change behavior.
   */
  languageCode?: string;
}

export interface ITTSGateway {
  /**
   * Synthesize text to audio. Returns audio buffer (e.g. MP3 bytes).
   */
  synthesize(params: TTSSynthesizeOptions): Promise<Uint8Array>;
}
