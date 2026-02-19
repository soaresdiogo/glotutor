'use client';

import Link from 'next/link';
import { useInactivityNudges } from '@/hooks/inactivity-nudges/use-inactivity-nudges';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
  it: 'Italian',
  fr: 'French',
  de: 'German',
};

export function InactivityNudgeBanner() {
  const { reminders, dismiss, practiceNow } = useInactivityNudges();

  if (reminders.length === 0) return null;

  const first = reminders[0];
  const name = LANGUAGE_NAMES[first.language] ?? first.language;

  return (
    <output className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-(--text)">
      <span>
        You haven&apos;t practiced {name} in {first.daysSinceActivity} days.
        Keep your streak alive! 🔥
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/dashboard"
          onClick={() => practiceNow(first.language)}
          className="rounded-lg bg-(--accent) px-3 py-1.5 font-medium text-white hover:opacity-90"
        >
          Practice now
        </Link>
        <button
          type="button"
          onClick={() => dismiss(first.language)}
          className="rounded-lg border border-(--border) bg-(--bg) px-3 py-1.5 hover:bg-(--bg-card)"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </output>
  );
}
