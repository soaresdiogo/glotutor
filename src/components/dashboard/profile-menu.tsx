'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { authApi } from '@/client-api/auth.api';
import { LanguageSelect } from '@/components/language-select';
import { useProgress } from '@/hooks/use-progress';
import { useTranslate } from '@/locales';
import { useAuth } from '@/providers/auth-provider';
import { useClickAway } from '../../hooks/use-click-away';
import { useAccountManageModal } from './account-manage-modal-provider';

function formatXp(xp: number): string {
  return xp.toLocaleString();
}

function getAvatarLetters(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts.at(0)?.charAt(0) ?? '';
    const last = parts.at(-1)?.charAt(0) ?? '';
    return (first + last).toUpperCase().slice(0, 2);
  }
  return (name.trim().charAt(0) ?? 'U').toUpperCase();
}

export function ProfileMenu() {
  const { t } = useTranslate();
  const router = useRouter();
  const { logout } = useAuth();
  const { openAccountModal } = useAccountManageModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: 1000 * 60 * 5,
  });
  const { data: progressData } = useProgress();
  const overview = progressData?.overview;
  const level = overview?.currentLevel ?? 'A1';
  const xp = overview == null ? '0' : formatXp(overview.totalXp);
  const levelXpLabel = t('dashboard.levelXp', { level, xp });

  useClickAway(ref, () => setOpen(false));

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.replace('/login');
  };

  const handleManageAccount = () => {
    setOpen(false);
    openAccountModal();
  };

  const displayName = user?.name ?? t('dashboard.guestUser');
  const avatarLetters = user?.name ? getAvatarLetters(user.name) : 'U';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-(--bg-elevated)"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('profile.menuLabel')}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-(--pink) to-(--orange) font-semibold text-white"
          aria-hidden
        >
          {avatarLetters}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-(--text)">
            {displayName}
          </span>
          <span className="block truncate text-xs text-(--text-muted)">
            {levelXpLabel}
          </span>
        </div>
        <svg
          className="h-4 w-4 shrink-0 text-(--text-muted) transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <title>{open ? t('profile.closeMenu') : t('profile.openMenu')}</title>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-xl border border-(--border) bg-(--bg-card) py-2 shadow-xl"
        >
          {user?.email && (
            <div className="border-b border-(--border) px-3 py-2">
              <p
                className="truncate text-sm text-(--text-muted)"
                title={user.email}
              >
                {user.email}
              </p>
            </div>
          )}
          <div className="border-b border-(--border) px-2 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleManageAccount}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--text) transition hover:bg-(--bg-elevated)"
            >
              <span aria-hidden>⚙️</span>
              {t('profile.manageAccount')}
            </button>
          </div>
          <div className="border-b border-(--border) px-3 pb-2 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--text-dim)">
              {t('profile.language')}
            </span>
            <div className="mt-2">
              <LanguageSelect className="w-full" />
            </div>
          </div>
          <div className="border-b border-(--border) px-2 py-1">
            <Link
              href="/dashboard/learning-preferences"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--text) transition hover:bg-(--bg-elevated)"
            >
              <span aria-hidden>🎯</span>
              {t('profile.learningPreferences')}
            </Link>
            <Link
              href="/dashboard/change-password"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--text) transition hover:bg-(--bg-elevated)"
            >
              <span aria-hidden>🔐</span>
              {t('profile.changePassword')}
            </Link>
          </div>
          <div className="px-2 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--text) transition hover:bg-(--red-bg) hover:text-(--red)"
            >
              <span aria-hidden>🚪</span>
              {t('common.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
