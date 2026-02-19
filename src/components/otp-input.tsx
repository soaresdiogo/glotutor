'use client';

import {
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

const LENGTH = 6;
const BOX_IDS = ['otp-0', 'otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5'] as const;

/** Single OTP box: visible border, distinct background, clear hit area for paste */
const inputClass =
  'w-12 h-14 text-center text-2xl font-mono font-semibold rounded-lg border-2 border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)] outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]';

const inputErrorClass =
  'border-[var(--red)] focus:border-[var(--red)] focus:ring-[var(--red)]/20';

type OtpInputProps = {
  readonly value?: string;
  onChange: (value: string) => void;
  readonly error?: boolean;
  readonly 'aria-label'?: string;
  readonly autoComplete?: string;
};

export function OtpInput({
  value = '',
  onChange,
  error,
  'aria-label': ariaLabel = 'Verification code',
  autoComplete,
}: Readonly<OtpInputProps>) {
  const labelId = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(() =>
    (value ?? '')
      .replaceAll(/\D/g, '')
      .slice(0, LENGTH)
      .padEnd(LENGTH, '')
      .split(''),
  );

  const syncValueToParent = useCallback(
    (nextDigits: string[]) => {
      const str = nextDigits.join('').slice(0, LENGTH);
      onChange(str);
    },
    [onChange],
  );

  useEffect(() => {
    const fromParent = (value ?? '').replaceAll(/\D/g, '').slice(0, LENGTH);
    const arr = fromParent.padEnd(LENGTH, '').split('');
    setDigits(arr);
  }, [value]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, newChar: string) => {
    const digit = newChar.replaceAll(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    syncValueToParent(next);
    if (digit && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      syncValueToParent(next);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replaceAll(/\D/g, '')
      .slice(0, LENGTH);
    if (!pasted) return;
    const arr = pasted.padEnd(LENGTH, '').split('');
    setDigits(arr);
    syncValueToParent(arr);
    const nextIndex = Math.min(pasted.length, LENGTH - 1);
    refs.current[nextIndex]?.focus();
  };

  return (
    <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
      <legend id={labelId} className="block text-sm font-medium text-(--text)">
        {ariaLabel}
      </legend>
      <div className="mt-4 flex gap-2 justify-center flex-wrap">
        {BOX_IDS.map((id, index) => (
          <input
            key={id}
            id={index === 0 ? `${labelId}-input` : undefined}
            aria-labelledby={labelId}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? autoComplete : 'off'}
            maxLength={1}
            value={digits[index] ?? ''}
            className={error ? `${inputClass} ${inputErrorClass}` : inputClass}
            aria-label={`Digit ${index + 1} of 6`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      <p className="text-xs text-(--text-muted) text-center">
        Enter the 6-digit code we sent to your email. You can paste it into any
        box.
      </p>
    </fieldset>
  );
}
