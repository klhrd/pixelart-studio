import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '../utils/a11y';

export function useKeyboardNavigation(
  items: Array<{ id: string; label: string }>,
  initialIndex: number = 0
) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case KEYS.ARROW_DOWN:
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case KEYS.ARROW_UP:
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case KEYS.ENTER:
        case KEYS.SPACE:
          e.preventDefault();
          break;
      }
    },
    [items]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    activeIndex,
    setActiveIndex,
    focused,
    setFocused,
    handleKeyDown,
  };
}

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (handlers[key]) {
        e.preventDefault();
        handlers[key]();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handlers]);
}
