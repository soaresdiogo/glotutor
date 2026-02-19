export type TextContentEntity = {
  id: string;
  content: string;
  languageCode: string;
};

export type TextVocabularyItemEntity = {
  word: string;
  phoneticIpa: string | null;
  definition: string | null;
  exampleSentence: string | null;
  partOfSpeech: string | null;
};

export type ComprehensionQuestionEntity = {
  id: string;
  type: string;
  question: string;
  question_translation?: string;
  correct_answer: string;
  explanation: string;
  tests?: string;
  difficulty?: string;
};

export type ReadingTextDetailEntity = {
  id: string;
  title: string;
  content: string;
  category: string;
  level: string;
  cefrLevel: string | null;
  wordCount: number | null;
  estimatedMinutes: number | null;
  languageCode: string;
  vocabulary: TextVocabularyItemEntity[];
  comprehension: ComprehensionQuestionEntity[];
};

export interface ITextRepository {
  findContentById(textId: string): Promise<TextContentEntity | null>;

  findPublishedDetailById(
    textId: string,
  ): Promise<ReadingTextDetailEntity | null>;
}
