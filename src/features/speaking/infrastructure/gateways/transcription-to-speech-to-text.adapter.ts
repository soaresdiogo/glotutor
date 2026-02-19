import type { ITranscriptionService } from '@/features/reading/domain/ports/transcription-service.interface';
import type { ISpeechToTextGateway } from '@/features/speaking/domain/ports/speech-to-text-gateway.interface';

/**
 * Adapter that reuses the Reading transcription service (Azure Speech)
 * for speech-to-text in the speaking message pipeline.
 */
export class TranscriptionToSpeechToTextAdapter
  implements ISpeechToTextGateway
{
  constructor(private readonly transcription: ITranscriptionService) {}

  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    languageCode: string,
  ): Promise<string> {
    const result = await this.transcription.transcribe(
      audioBuffer,
      mimeType,
      languageCode,
    );
    const text = result.words
      .map((w) => w.word)
      .join(' ')
      .trim();
    return text;
  }
}
