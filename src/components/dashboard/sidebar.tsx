'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId } from 'react';
import { useSidebarCounts } from '@/hooks/use-sidebar-counts';
import { useTranslate } from '@/locales';
import { ProfileMenu } from './profile-menu';
import { SidebarLearningBlock } from './sidebar-learning-block';

type SidebarProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

type NavItem = {
  href: string;
  icon: string;
  labelKey: string;
  badge?: string;
  disabled?: boolean;
};

const NAV_CONTENT: NavItem[] = [
  {
    href: '/dashboard/podcasts',
    icon: '🎙️',
    labelKey: 'dashboard.podcasts',
    disabled: true,
  },
  {
    href: '/dashboard/articles',
    icon: '📰',
    labelKey: 'dashboard.articles',
    disabled: true,
  },
  {
    href: '/dashboard/conversations',
    icon: '💬',
    labelKey: 'dashboard.conversations',
    disabled: true,
  },
  {
    href: '/dashboard/vocabulary',
    icon: '📚',
    labelKey: 'dashboard.vocabulary',
    disabled: true,
  },
];

const NAV_COMMUNITY: NavItem[] = [
  {
    href: '/dashboard/leaderboard',
    icon: '🏆',
    labelKey: 'dashboard.leaderboard',
    disabled: true,
  },
  {
    href: '/dashboard/study-groups',
    icon: '👥',
    labelKey: 'dashboard.studyGroups',
    disabled: true,
  },
];

type NavSectionProps = Readonly<{
  labelKey: string;
  items: ReadonlyArray<NavItem>;
  onClose: () => void;
}>;

function NavSection({ labelKey, items, onClose }: NavSectionProps) {
  const pathname = usePathname();
  const { t } = useTranslate();

  return (
    <section className="mb-6" aria-label={t(labelKey)}>
      <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-(--text-dim)">
        {t(labelKey)}
      </h2>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = !item.disabled && pathname === item.href;
          const content = (
            <>
              <span
                className="flex h-5 w-5 items-center justify-center text-lg"
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium">
                {t(item.labelKey)}
              </span>
              {item.badge != null && item.badge !== '' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                    isActive
                      ? 'bg-(--accent) text-white'
                      : 'bg-(--bg-elevated) text-(--text-dim)'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </>
          );

          return item.disabled ? (
            <li key={item.href}>
              <span
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-3 text-left text-(--text-muted) opacity-60"
                aria-disabled="true"
              >
                {content}
              </span>
            </li>
          ) : (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${
                  isActive
                    ? 'border border-(--accent-border) bg-(--accent-soft) text-(--accent)'
                    : 'text-(--text-muted) hover:bg-(--bg-elevated) hover:text-(--text)'
                }`}
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const sidebarId = useId();
  const { t } = useTranslate();
  const {
    pathLevel,
    speakingCount,
    listeningCount,
    readingCount,
    nativeLessonsCount,
    isLoading,
  } = useSidebarCounts();

  const navMain: NavItem[] = [
    { href: '/dashboard', icon: '🏠', labelKey: 'dashboard.title' },
    {
      href: '/dashboard/path',
      icon: '🎯',
      labelKey: 'dashboard.myPath',
      badge: pathLevel,
    },
    {
      href: '/dashboard/progress',
      icon: '📊',
      labelKey: 'dashboard.progressNav',
    },
    {
      href: '/dashboard/level-progress',
      icon: '📈',
      labelKey: 'dashboard.levelProgress',
    },
    {
      href: '/dashboard/stats',
      icon: '📉',
      labelKey: 'dashboard.stats',
    },
  ];

  const navPractice: NavItem[] = [
    {
      href: '/dashboard/native-lessons',
      icon: '📖',
      labelKey: 'dashboard.learning',
      badge: isLoading ? '…' : String(nativeLessonsCount),
    },
    {
      href: '/dashboard/reading',
      icon: '📖',
      labelKey: 'dashboard.reading',
      badge: isLoading ? '…' : String(readingCount),
    },
    {
      href: '/dashboard/listening',
      icon: '👂',
      labelKey: 'dashboard.listening',
      badge: isLoading ? '…' : String(listeningCount),
    },
    {
      href: '/dashboard/speaking',
      icon: '🗣️',
      labelKey: 'dashboard.speaking',
      badge: isLoading ? '…' : String(speakingCount),
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        aria-hidden
        onClick={onClose}
        style={{ display: open ? 'block' : 'none' }}
      />
      <aside
        id={sidebarId}
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-(--border) bg-(--bg-card) transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        aria-label={t('dashboard.navLabel')}
      >
        <header className="border-b border-(--border) px-5 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 no-underline"
            onClick={onClose}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-(--accent) to-(--cyan) text-xl">
              🎓
            </div>
            <div>
              <span className="text-lg font-medium text-(--text)">
                glotutor.com
              </span>
              <p className="text-[11px] text-(--text-dim) tracking-wide">
                {t('dashboard.tagline')}
              </p>
            </div>
          </Link>
        </header>

        <SidebarLearningBlock />

        <nav
          className="flex-1 overflow-y-auto px-3 py-5"
          aria-label={t('dashboard.title')}
        >
          <NavSection
            labelKey="dashboard.navMain"
            items={navMain}
            onClose={onClose}
          />
          <NavSection
            labelKey="dashboard.navPractice"
            items={navPractice}
            onClose={onClose}
          />
          <NavSection
            labelKey="dashboard.navContent"
            items={NAV_CONTENT}
            onClose={onClose}
          />
          <NavSection
            labelKey="dashboard.navCommunity"
            items={NAV_COMMUNITY}
            onClose={onClose}
          />
        </nav>

        <footer className="border-t border-(--border) px-5 py-4">
          <ProfileMenu />
        </footer>
      </aside>
    </>
  );
}
