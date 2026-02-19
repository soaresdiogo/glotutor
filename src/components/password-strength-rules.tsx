'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslate } from '@/locales';

const RULE_KEYS = [
  'length',
  'uppercase',
  'lowercase',
  'number',
  'special',
] as const;

const RULE_TRANSLATION_KEYS = {
  length: 'password.atLeast8Chars',
  uppercase: 'password.oneUppercase',
  lowercase: 'password.oneLowercase',
  number: 'password.oneNumber',
  special: 'password.oneSpecialChar',
} as const;

const RULE_TESTS: Record<(typeof RULE_KEYS)[number], (p: string) => boolean> = {
  length: (p) => p.length >= 8,
  uppercase: (p) => /[A-Z]/.test(p),
  lowercase: (p) => /[a-z]/.test(p),
  number: (p) => /\d/.test(p),
  special: (p) => /[^A-Za-z0-9]/.test(p),
};

type PasswordStrengthRulesProps = {
  readonly password: string;
  readonly className?: string;
};

export function PasswordStrengthRules({
  password,
  className = '',
}: PasswordStrengthRulesProps) {
  const { t } = useTranslate();

  return (
    <ul
      className={`flex flex-col gap-1.5 text-sm ${className}`}
      aria-label={t('password.passwordRequirements')}
    >
      {RULE_KEYS.map((key) => {
        const met = RULE_TESTS[key](password);
        return (
          <li
            key={key}
            className="flex items-center gap-2"
            aria-current={met ? undefined : 'true'}
          >
            {met ? (
              <CheckCircle2
                className="h-4 w-4 shrink-0 text-(--green)"
                aria-hidden
              />
            ) : (
              <Circle
                className="h-4 w-4 shrink-0 text-(--text-dim)"
                aria-hidden
              />
            )}
            <span className={met ? 'text-(--text-muted)' : 'text-(--text)'}>
              {t(RULE_TRANSLATION_KEYS[key])}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
