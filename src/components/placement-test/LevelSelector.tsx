'use client';

type LevelSelectorProps = {
  levels: readonly string[];
  selectedLevel: string;
  onSelect: (level: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
};

export function LevelSelector({
  levels,
  selectedLevel,
  onSelect,
  onConfirm,
  disabled = false,
}: LevelSelectorProps) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
      <p className="mb-4 text-(--text-muted)">
        Choose the level you want to start with:
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            disabled={disabled}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              selectedLevel === level
                ? 'border-(--accent) bg-(--accent) text-white'
                : 'border-(--border) bg-(--bg) text-(--text) hover:border-(--accent)'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className="w-full rounded-xl bg-(--accent) py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        Start at {selectedLevel}
      </button>
    </div>
  );
}
