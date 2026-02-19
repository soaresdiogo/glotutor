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

/** Map of language code -> current level for already-added languages */
export type ExistingLanguagesMap = Map<string, string>;

type LanguageGridProps = {
  onSelect: (language: string) => void;
  selectedLanguage: string | null;
  disabled?: boolean;
  /** Already-added languages: shown as non-clickable with "Studying — Level X" */
  existingLanguages?: ExistingLanguagesMap;
};

export function LanguageGrid({
  onSelect,
  selectedLanguage,
  disabled = false,
  existingLanguages,
}: LanguageGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {LANGUAGES.map((lang) => {
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
