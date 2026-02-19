/**
 * Shape of the `content` JSONB column in native_lessons.
 * Used for theory sections and exercises.
 */

export interface LessonSectionIntro {
  title: string;
  text: string;
}

export interface LessonSectionExample {
  native: string;
  translation: string;
  context: string;
  never_say?: string;
}

export interface LessonSectionContent {
  intro: LessonSectionIntro;
  examples: LessonSectionExample[];
  cultural_note?: string;
}

export interface LessonSection {
  type: 'CONCEPT';
  icon: string;
  title: string;
  content: LessonSectionContent;
}

export interface ReorderExercise {
  type: 'REORDER';
  prompt: string;
  scenario?: string;
  words: string[];
  answer: string;
}

export interface SituationExercise {
  type: 'SITUATION';
  prompt: string;
  scenario: string;
  placeholder?: string;
  hint?: string;
  evaluation_context: string;
}

export interface MatchExercise {
  type: 'MATCH';
  prompt: string;
  pairs: Array<{ situation: string; chunk: string }>;
}

export interface ChoiceExercise {
  type: 'CHOICE';
  prompt: string;
  scenario: string;
  options: Array<{
    text: string;
    correct: boolean;
    explanation: string;
  }>;
}

export interface TransformExercise {
  type: 'TRANSFORM';
  prompt: string;
  pairs: Array<{ textbook: string; hint?: string }>;
  evaluation_context: string;
}

export type LessonExercise =
  | ReorderExercise
  | SituationExercise
  | MatchExercise
  | ChoiceExercise
  | TransformExercise;

export interface LessonContent {
  sections: LessonSection[];
  exercises: LessonExercise[];
}
