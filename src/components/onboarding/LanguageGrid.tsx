'use client';

export type LanguageOption = {
  code: string;
  name: string;
  flag: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
];

/**
 * Returns true when the study language is the same as the user's native language
 * (e.g. pt matches pt-BR, en matches en).
 */
function isNativeLanguage(
  studyLangCode: string,
  nativeLanguageCode: string | null | undefined,
): boolean {
  if (nativeLanguageCode == null || nativeLanguageCode === '') return false;
  const nativeBase = nativeLanguageCode.split('-')[0];
  return studyLangCode === nativeBase || studyLangCode === nativeLanguageCode;
}

/**
 * Languages available for study, excluding the user's native language when provided.
 */
export function getLanguagesForStudy(
  nativeLanguageCode?: string | null,
): LanguageOption[] {
  if (nativeLanguageCode == null || nativeLanguageCode === '') {
    return [...LANGUAGES];
  }
  return LANGUAGES.filter(
    (lang) => !isNativeLanguage(lang.code, nativeLanguageCode),
  );
}

/** Map of language code -> current level for already-added languages */
export type ExistingLanguagesMap = Map<string, string>;

type LanguageGridProps = {
  onSelect: (language: string) => void;
  selectedLanguage: string | null;
  disabled?: boolean;
  /** Already-added languages: shown as non-clickable with "Studying — Level X" */
  existingLanguages?: ExistingLanguagesMap;
  /** When set, the language matching this code (e.g. pt-BR, en) is excluded from the list */
  excludeNativeLanguageCode?: string | null;
};

export function LanguageGrid({
  onSelect,
  selectedLanguage,
  disabled = false,
  existingLanguages,
  excludeNativeLanguageCode,
}: LanguageGridProps) {
  const languagesToShow = getLanguagesForStudy(excludeNativeLanguageCode);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {languagesToShow.map((lang) => {
        const addedLevel = existingLanguages?.get(lang.code);
        const isAdded = addedLevel !== undefined;
        const isClickable = !disabled && !isAdded;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => isClickable && onSelect(lang.code)}
            disabled={!isClickable}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition focus:outline-none focus:ring-2 focus:ring-(--accent) focus:ring-offset-2 ${
              isAdded
                ? 'cursor-default border-(--border) bg-(--bg-elevated) opacity-90'
                : selectedLanguage === lang.code
                  ? 'border-(--accent) bg-(--accent/10)'
                  : 'border-(--border) bg-(--bg-card) hover:border-(--accent/50) hover:bg-(--bg-elevated)'
            }`}
          >
            <span className="text-4xl" aria-hidden>
              {lang.flag}
            </span>
            <span className="text-sm font-medium text-(--text)">
              {lang.name}
            </span>
            {isAdded && (
              <span className="text-xs text-(--text-muted)">
                Studying — Level {addedLevel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { LANGUAGES };
