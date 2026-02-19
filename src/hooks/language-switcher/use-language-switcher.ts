'use client';

import { useAddLanguageModal } from '@/components/onboarding/AddLanguageModalProvider';
import { useLanguageContext } from '@/providers/language-provider';

const LANGUAGE_NAMES: Record<string, string> = {
  pt: 'Portuguese',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  fr: 'French',
  de: 'German',
};

const FLAGS: Record<string, string> = {
  pt: '🇵🇹',
  en: '🇬🇧',
  es: '🇪🇸',
  it: '🇮🇹',
  fr: '🇫🇷',
  de: '🇩🇪',
};

export function useLanguageSwitcher() {
  const { activeLanguage, setActiveLanguage, languages, isLoading } =
    useLanguageContext();
  const { openAddLanguageModal } = useAddLanguageModal();

  const switchTo = (language: string) => {
    setActiveLanguage(language);
  };

  const goToAddLanguage = () => {
    openAddLanguageModal();
  };

  return {
    activeLanguage,
    activeLanguageName: LANGUAGE_NAMES[activeLanguage] ?? activeLanguage,
    activeFlag: FLAGS[activeLanguage] ?? '🌐',
    languages,
    isLoading,
    switchTo,
    goToAddLanguage,
    getLanguageName: (code: string) => LANGUAGE_NAMES[code] ?? code,
    getFlag: (code: string) => FLAGS[code] ?? '🌐',
  };
}
