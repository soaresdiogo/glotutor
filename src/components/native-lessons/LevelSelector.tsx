'use client';

import { useTranslate } from '@/locales';

const LEVEL_COLORS: Record<
  string,
  { border: string; bg: string; tag: string }
> = {
  A1: { border: 'var(--green)', bg: 'var(--green-bg)', tag: 'var(--green)' },
  A2: { border: 'var(--cyan)', bg: 'var(--cyan-bg)', tag: 'var(--cyan)' },
  B1: {
    border: 'var(--accent)',
    bg: 'var(--accent-soft)',
    tag: 'var(--accent)',
  },
  B2: { border: 'var(--orange)', bg: 'var(--orange-bg)', tag: 'var(--orange)' },
  C1: { border: 'var(--pink)', bg: 'var(--pink-bg)', tag: 'var(--pink)' },
  C2: { border: 'var(--red)', bg: 'var(--red-bg)', tag: 'var(--red)' },
};

type Props = {
  levels: readonly string[];
  selectedLevel: string;
  onSelect: (level: string) => void;
};

export function LevelSelector({ levels, selectedLevel, onSelect }: Props) {
  const { t } = useTranslate();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {levels.map((level) => {
        const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS.A1;
        const isSelected = selectedLevel === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            className={`rounded-xl border p-4 text-left transition hover:border-(--border-light) ${
              isSelected
                ? 'border-(--accent) bg-(--accent-soft)'
                : 'border-(--border) bg-(--bg-card)'
            }`}
            style={
              !isSelected
                ? { borderTopWidth: '3px', borderTopColor: colors.border }
                : undefined
            }
          >
            <span
              className="mb-2 inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold"
              style={{ background: colors.bg, color: colors.tag }}
            >
              {level}
            </span>
            <p className="text-sm font-medium text-(--text)">
              {t(`nativeLessons.levels.${level}`)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
