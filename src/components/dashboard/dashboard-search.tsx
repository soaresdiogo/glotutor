'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';
import { searchApi } from '@/client-api/search.api';
import { useClickAway } from '@/hooks/use-click-away';
import { useTranslate } from '@/locales';

const DEBOUNCE_MS = 300;

export function DashboardSearch() {
  const { t } = useTranslate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateDebounced = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  }, []);

  const { data, isPending } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60,
  });

  const hasAnyResults = data && hasResults(data);
  const showDropdown =
    query.length >= 2 && (isPending || (data !== undefined && hasAnyResults));
  const isEmpty = data !== undefined && !hasResults(data);

  useClickAway(containerRef, () => {
    setQuery('');
    setDebouncedQuery('');
  });

  function hasResults(d: typeof data) {
    if (!d) return false;
    return d.lessons.length > 0 || d.topics.length > 0 || d.texts.length > 0;
  }

  let dropdownContent: ReactNode;
  if (isPending) {
    dropdownContent = (
      <p className="px-4 py-3 text-sm text-(--text-muted)">
        {t('common.loading')}
      </p>
    );
  } else if (isEmpty) {
    dropdownContent = (
      <p className="px-4 py-3 text-sm text-(--text-muted)">
        {t('dashboard.searchNoResults')}
      </p>
    );
  } else if (data && hasResults(data)) {
    const results = data;
    dropdownContent = (
      <>
        {results.lessons.length > 0 && (
          <div className="mb-2 px-3 py-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
              {t('dashboard.learning')}
            </p>
          </div>
        )}
        {results.lessons.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/native-lessons/${item.id}`}
            className="flex items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-(--text) transition hover:bg-(--bg-elevated)"
          >
            <span className="min-w-0 truncate">{item.title}</span>
            <span className="shrink-0 rounded bg-(--bg-muted) px-1.5 py-0.5 text-xs text-(--text-muted)">
              {item.level}
            </span>
          </Link>
        ))}
        {results.topics.length > 0 && (
          <div className="mb-2 mt-2 border-t border-(--border) px-3 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
              {t('dashboard.speaking')}
            </p>
          </div>
        )}
        {results.topics.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/speaking/${item.slug}`}
            className="block truncate px-4 py-2.5 text-left text-sm text-(--text) transition hover:bg-(--bg-elevated)"
          >
            {item.title}
          </Link>
        ))}
        {results.texts.length > 0 && (
          <div className="mb-2 mt-2 border-t border-(--border) px-3 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
              {t('dashboard.reading')}
            </p>
          </div>
        )}
        {results.texts.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/reading/${item.id}`}
            className="block truncate px-4 py-2.5 text-left text-sm text-(--text) transition hover:bg-(--bg-elevated)"
          >
            {item.title}
          </Link>
        ))}
      </>
    );
  } else {
    dropdownContent = null;
  }

  return (
    <div
      ref={containerRef}
      className="relative hidden w-80 max-w-full md:block"
    >
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-dim)"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <title>{t('dashboard.searchPlaceholder')}</title>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => updateDebounced(e.target.value)}
        placeholder={t('dashboard.searchPlaceholder')}
        className="w-full rounded-xl border border-(--border) bg-(--bg-elevated) py-2.5 pl-10 pr-4 text-sm text-(--text) placeholder:text-(--text-dim) outline-none transition focus:border-(--accent) focus:bg-(--bg)"
        aria-label={t('dashboard.searchPlaceholder')}
      />
      {showDropdown && (
        <section
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(60vh,400px)] overflow-y-auto rounded-xl border border-(--border) bg-(--bg-card) py-2 shadow-xl"
          aria-label={t('dashboard.searchPlaceholder')}
        >
          {dropdownContent}
        </section>
      )}
    </div>
  );
}
