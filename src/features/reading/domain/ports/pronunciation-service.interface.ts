export interface IPronunciationService {
  getAudioUrl(word: string, languageCode: string): Promise<string>;
}
