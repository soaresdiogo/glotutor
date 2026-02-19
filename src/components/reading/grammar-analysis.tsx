'use client';

import type { GrammarItem } from '@/client-api/reading.api';

import { useTranslate } from '@/locales';

type GrammarAnalysisProps = Readonly<{
  items: GrammarItem[];
  onHighlightSentence?: (sentence: string) => void;
}>;

export function GrammarAnalysis({
  items,
  onHighlightSentence,
}: GrammarAnalysisProps) {
  const { t } = useTranslate();
  if (items.length === 0) return null;

  const byStructure = items.reduce<Record<string, GrammarItem[]>>(
    (acc, item) => {
      const key = item.structure ?? 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
      <h3 className="text-xl font-medium text-(--text) mb-4">
        {t('reading.grammarInText')}
      </h3>
      <div className="space-y-4">
        {Object.entries(byStructure).map(([structure, list]) => (
          <div key={structure}>
            <span className="inline-block rounded-full border border-(--accent-border) bg-(--accent-soft) px-3 py-0.5 text-[11px] font-semibold uppercase text-(--accent)">
              {structure}
            </span>
            <ul className="mt-2 space-y-3">
              {list.map((item) => (
                <li
                  key={`${structure}-${item.sentence ?? ''}-${item.explanation ?? ''}-${item.pattern ?? ''}`}
                  className="rounded-lg border border-(--border) bg-(--bg-elevated) p-4"
                >
                  {item.sentence && (
                    <button
                      type="button"
                      onClick={() => onHighlightSentence?.(item.sentence)}
                      className="cursor-pointer text-left text-sm text-(--text) hover:underline"
                    >
                      &quot;{item.sentence}&quot;
                    </button>
                  )}
                  {item.explanation && (
                    <p className="mt-2 text-[13px] leading-relaxed text-(--text-muted)">
                      {item.explanation}
                    </p>
                  )}
                  {item.pattern && (
                    <p className="mt-1 font-mono text-[12px] text-(--text-dim)">
                      {item.pattern}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
