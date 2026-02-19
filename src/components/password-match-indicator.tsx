'use client';

import { Check, X } from 'lucide-react';
import { useTranslate } from '@/locales';

type PasswordMatchIndicatorProps = {
  readonly password: string;
  readonly confirmPassword: string;
};

export function PasswordMatchIndicator({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) {
  const { t } = useTranslate();

  if (password.length === 0 && confirmPassword.length === 0) {
    return null;
  }

  if (confirmPassword.length === 0) {
    return null;
  }

  const match = password === confirmPassword;

  return (
    <output
      className="flex items-center gap-2 text-sm"
      htmlFor=""
      aria-live="polite"
    >
      {match ? (
        <>
          <Check className="h-4 w-4 shrink-0 text-(--green)" aria-hidden />
          <span className="text-(--green)">{t('password.passwordsMatch')}</span>
        </>
      ) : (
        <>
          <X className="h-4 w-4 shrink-0 text-(--red)" aria-hidden />
          <span className="text-(--red)">
            {t('password.passwordsDoNotMatch')}
          </span>
        </>
      )}
    </output>
  );
}
