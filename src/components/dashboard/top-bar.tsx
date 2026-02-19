'use client';

import { DashboardSearch } from '@/components/dashboard/dashboard-search';
import { useTranslate } from '@/locales';

type TopBarProps = Readonly<{
  onMenuClick: () => void;
}>;

export function TopBar({ onMenuClick }: TopBarProps) {
  const { t } = useTranslate();
  const notificationCount = 0;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-(--border) bg-(--bg-card) px-4 py-3 backdrop-blur-md sm:px-6 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--bg-elevated) text-(--text-muted) transition hover:border-(--border-light) hover:text-(--text) md:hidden"
          aria-label={t('dashboard.openMenu')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <title>{t('dashboard.openMenu')}</title>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <DashboardSearch />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--bg-elevated) text-(--text-muted) transition hover:border-(--border-light) hover:text-(--text)"
          aria-label={t('dashboard.notifications')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <title>{t('dashboard.notifications')}</title>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-(--red) text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
