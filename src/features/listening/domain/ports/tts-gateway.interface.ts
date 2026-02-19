export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'nova' | 'onyx' | 'shimmer';
export type TTSModel = 'tts-1' | 'tts-1-hd';

export interface TTSSynthesizeOptions {
  text: string;
  voice: TTSVoice;
  /** 0.25 to 4.0, default 1.0 */
  speed?: number;
  /** default tts-1-hd for quality */
  model?: TTSModel;
}

export interface ITTSGateway {
  /**
   * Synthesize text to audio. Returns audio buffer (e.g. MP3 bytes).
   */
  synthesize(params: TTSSynthesizeOptions): Promise<Uint8Array>;
}
