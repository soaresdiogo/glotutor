export type WordDetailsResult = {
  phoneticIpa: string | null;
  definition: string | null;
};

export interface IWordDetailsService {
  getWordDetails(
    word: string,
    textLanguageCode: string,
    nativeLanguageCode: string,
  ): Promise<WordDetailsResult>;
}
