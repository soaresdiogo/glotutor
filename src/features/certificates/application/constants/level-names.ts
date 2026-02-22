/** CEFR level display names per language (certificate language). */
export const CERTIFICATE_LEVEL_NAMES: Record<string, Record<string, string>> = {
  en: {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficient',
  },
  pt: {
    A1: 'Iniciante',
    A2: 'Elementar',
    B1: 'Intermediário',
    B2: 'Intermediário Superior',
    C1: 'Avançado',
    C2: 'Proficiente',
  },
  es: {
    A1: 'Principiante',
    A2: 'Elemental',
    B1: 'Intermedio',
    B2: 'Intermedio Superior',
    C1: 'Avanzado',
    C2: 'Competente',
  },
  fr: {
    A1: 'Débutant',
    A2: 'Élémentaire',
    B1: 'Intermédiaire',
    B2: 'Intermédiaire supérieur',
    C1: 'Avancé',
    C2: 'Maîtrise',
  },
  de: {
    A1: 'Anfänger',
    A2: 'Grundlegend',
    B1: 'Mittelstufe',
    B2: 'Gute Mittelstufe',
    C1: 'Fortgeschritten',
    C2: 'Exzellent',
  },
  it: {
    A1: 'Principiante',
    A2: 'Elementare',
    B1: 'Intermedio',
    B2: 'Intermedio superiore',
    C1: 'Avanzato',
    C2: 'Padronanza',
  },
};

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

function getLevelNamesForLang(lang: string): Record<string, string> {
  const base = lang.split('-')[0]?.toLowerCase() ?? 'en';
  return CERTIFICATE_LEVEL_NAMES[base] ?? CERTIFICATE_LEVEL_NAMES.en;
}

export function getLevelName(language: string, cefrLevel: string): string {
  return getLevelNamesForLang(language)[cefrLevel] ?? cefrLevel;
}

export function getLanguageName(langCode: string): string {
  const base = langCode.split('-')[0]?.toLowerCase() ?? 'en';
  return LANGUAGE_NAMES[base] ?? langCode;
}
