import de from './de.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import it from './it.json';
import pt from './pt.json';
import type { LocaleCode } from './types';

export type TranslationRecord = Record<string, string>;

export const translations: Record<LocaleCode, TranslationRecord> = {
  en: en as TranslationRecord,
  pt: pt as TranslationRecord,
  es: es as TranslationRecord,
  it: it as TranslationRecord,
  fr: fr as TranslationRecord,
  de: de as TranslationRecord,
};
