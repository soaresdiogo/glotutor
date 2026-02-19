/**
 * Gateway for converting text to speech audio.
 * Used by the speaking message pipeline (Azure TTS or fallback).
 */
export interface ITextToSpeechGateway {
  /**
   * Synthesize text to audio. Returns MP3 bytes (or format suitable for base64 response).
   */
  synthesize(
    text: string,
    languageCode: string,
    options?: { voice?: string },
  ): Promise<Uint8Array>;
}
