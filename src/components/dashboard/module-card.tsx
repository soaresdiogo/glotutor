'use client';

import Link from 'next/link';
import { useTranslate } from '@/locales';

type ModuleVariant = 'speaking' | 'listening' | 'reading' | 'learning';

const GRADIENTS: Record<ModuleVariant, { header: string; fill: string }> = {
  speaking: {
    header: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fill: 'linear-gradient(90deg, #667eea, #764ba2)',
  },
  listening: {
    header: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    fill: 'linear-gradient(90deg, #f093fb, #f5576c)',
  },
  reading: {
    header: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    fill: 'linear-gradient(90deg, #4facfe, #00f2fe)',
  },
  learning: {
    header: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    fill: 'linear-gradient(90deg, #43e97b, #38f9d7)',
  },
};

type ModuleCardProps = Readonly<{
  variant: ModuleVariant;
  href: string;
  titleKey: string;
  descKey: string;
  progress: number;
}>;

export function ModuleCard({
  variant,
  href,
  titleKey,
  descKey,
  progress,
}: ModuleCardProps) {
  const { t } = useTranslate();
  const { header, fill } = GRADIENTS[variant];

  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) text-inherit no-underline transition hover:-translate-y-1 hover:border-(--border-light) hover:shadow-2xl"
    >
      <div
        className="flex h-32 items-center justify-center"
        style={{ background: header }}
      >
        <span className="text-5xl drop-shadow-lg" aria-hidden>
          {variant === 'speaking' && '🗣️'}
          {variant === 'listening' && '👂'}
          {variant === 'reading' && '📖'}
          {variant === 'learning' && '🧠'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-lg font-semibold text-(--text)">
          {t(titleKey)}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-(--text-muted)">
          {t(descKey)}
        </p>
        <div>
          <div className="mb-1.5 flex justify-between text-xs text-(--text-dim)">
            <span>{t('dashboard.progress')}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-(--bg-elevated)">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progress}%`, background: fill }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
