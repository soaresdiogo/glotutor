'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslate } from '@/locales';

const inputBaseClass =
  'w-full rounded-xl border border-(--border) bg-(--bg-elevated) px-4 py-3.5 pr-12 text-(--text) placeholder:text-(--text-dim) outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)';

type PasswordInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  /** Optional content to show on the right of the label (e.g. "Forgot?" link) */
  labelRight?: React.ReactNode;
} & React.ComponentPropsWithoutRef<'input'>;

export function PasswordInput({
  id,
  label,
  placeholder = '••••••••',
  error,
  hint,
  labelRight,
  className,
  ...rest
}: PasswordInputProps) {
  const { t } = useTranslate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {labelRight ? (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-medium text-(--text)">
            {label}
          </label>
          {labelRight}
        </div>
      ) : (
        <label htmlFor={id} className="text-sm font-medium text-(--text)">
          {label}
        </label>
      )}
      {hint && <p className="text-xs text-(--text-muted)">{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={inputBaseClass + (className ? ` ${className}` : '')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-(--text-muted) transition hover:bg-(--bg-hover) hover:text-(--text)"
          aria-label={
            showPassword
              ? t('password.hidePassword')
              : t('password.showPassword')
          }
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden />
          ) : (
            <Eye className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-(--red)">
          {error}
        </p>
      )}
    </div>
  );
}
