'use client';

import type { LessonSection } from '@/client-api/native-lessons.api';

type Props = {
  section: LessonSection;
};

export function ConceptSection({ section }: Props) {
  const { content, icon, title } = section;
  return (
    <section className="rounded-xl border border-(--border) bg-(--bg-card) overflow-hidden">
      <div className="flex items-center gap-3 border-b border-(--border) px-5 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--bg-elevated) text-lg">
          {icon}
        </span>
        <h3 className="text-base font-semibold text-(--text)">{title}</h3>
        <span className="ml-auto rounded-full bg-(--bg-elevated) px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">
          Concept
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="rounded-lg border-l-4 border-(--accent) bg-(--bg-elevated) p-4">
          <h4 className="text-sm font-semibold text-(--text)">
            {content.intro.title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-(--text-muted)">
            {content.intro.text}
          </p>
        </div>
        {content.examples.map((ex) => (
          <div
            key={`${ex.native}-${ex.translation}`}
            className="rounded-lg border border-(--border) bg-(--bg) p-4"
          >
            <p className="font-semibold text-(--text)">{ex.native}</p>
            <p className="mt-1 text-sm italic text-(--text-muted)">
              {ex.translation}
            </p>
            <p className="mt-2 inline-block rounded bg-(--bg-elevated) px-2 py-1 text-xs text-(--text-dim)">
              {ex.context}
            </p>
            {ex.never_say && (
              <p className="mt-2 flex items-center gap-1 text-xs text-(--red)">
                <span>❌</span> {ex.never_say}
              </p>
            )}
          </div>
        ))}
        {content.cultural_note && (
          <div className="rounded-lg border border-(--yellow-border) bg-(--yellow-bg) p-4 text-sm text-(--yellow)">
            <strong className="text-(--text)">Cultural note:</strong>{' '}
            {content.cultural_note}
          </div>
        )}
      </div>
    </section>
  );
}
