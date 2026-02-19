export type TranscribedWord = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
};

export type TranscriptionResult = {
  words: TranscribedWord[];
  durationSeconds: number;
};

export interface ITranscriptionService {
  transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    languageCode: string,
  ): Promise<TranscriptionResult>;
}
