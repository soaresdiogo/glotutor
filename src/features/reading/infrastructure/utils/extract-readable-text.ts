export type ComprehensionQuestion = {
  id: string;
  type: string;
  question: string;
  question_translation?: string;
  correct_answer: string;
  explanation: string;
  tests?: string;
  difficulty?: string;
};

/**
 * Extracts the plain text that the student should read aloud from stored reading content.
 * Stored content can be either:
 * - Full JSON from content generation (reading_text, vocabulary, comprehension, etc.)
 * - Plain text (legacy or manual entries)
 */
export function extractReadableTextFromContent(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (!trimmed.startsWith('{')) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const readingText = parsed.reading_text as
      | Record<string, unknown>
      | undefined;
    if (!readingText || typeof readingText !== 'object') return trimmed;

    const content = readingText.content;
    if (typeof content === 'string') return content;

    if (content && typeof content === 'object') {
      const obj = content as Record<string, unknown>;
      if (typeof obj.text === 'string') {
        return obj.text.replaceAll('\\n', '\n');
      }
      const paragraphs = obj.paragraphs as string[] | undefined;
      if (Array.isArray(paragraphs) && paragraphs.length > 0) {
        return paragraphs.join('\n\n');
      }
    }
  } catch {
    // Not JSON or invalid — return as-is
  }
  return trimmed;
}

/**
 * Extracts comprehension questions from stored reading content JSON.
 * Returns empty array if content is not JSON or has no comprehension array.
 */
export function extractComprehensionFromContent(
  raw: string,
): ComprehensionQuestion[] {
  const trimmed = raw.trim();
  if (!trimmed || !trimmed.startsWith('{')) return [];

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const comprehension = parsed.comprehension;
    if (!Array.isArray(comprehension) || comprehension.length === 0) return [];

    return comprehension.filter((q): q is ComprehensionQuestion => {
      if (!q || typeof q !== 'object') return false;
      const o = q as Record<string, unknown>;
      return (
        typeof o.id === 'string' &&
        typeof o.question === 'string' &&
        typeof o.correct_answer === 'string' &&
        typeof o.explanation === 'string'
      );
    });
  } catch {
    return [];
  }
}
