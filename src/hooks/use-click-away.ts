'use client';

import { type RefObject, useEffect } from 'react';

export function useClickAway(
  ref: RefObject<HTMLElement | null>,
  onClickAway: () => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) {
        onClickAway();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onClickAway]);
}
