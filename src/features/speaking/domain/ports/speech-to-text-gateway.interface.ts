/**
 * Gateway for converting speech (audio) to text.
 * Used by the speaking message pipeline (Azure STT or adapter over existing transcription).
 */
export interface ISpeechToTextGateway {
  /**
   * Transcribe audio buffer to plain text in the given language.
   */
  transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    languageCode: string,
  ): Promise<string>;
}
