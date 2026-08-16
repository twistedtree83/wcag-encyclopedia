import { useCallback, useEffect, useState } from 'react';
import type { ThemeName } from './tokens';

export const THEME_STORAGE_KEY = 'wcag-encyclopedia:theme';

export type StoredChoice = ThemeName | null;

/**
 * What theme should be shown, given what the reader chose and what their OS says.
 *
 * Pure, so the rule is testable without a browser. The rule itself is one line, but it is the
 * one people get wrong: **an explicit choice wins in both directions.** A reader on a dark OS
 * who picks light must get light on their next visit — the common bug is to treat the stored
 * value as an "override to dark" only, and silently ignore a stored "light".
 */
export function resolveTheme(stored: StoredChoice, systemPrefersDark: boolean): ThemeName {
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark ? 'dark' : 'light';
}

/** Narrow whatever came out of storage to a choice we recognise. */
export function readChoice(raw: string | null): StoredChoice {
  return raw === 'light' || raw === 'dark' ? raw : null;
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function storedChoice(): StoredChoice {
  try {
    return readChoice(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // Private browsing, disabled storage — fall back to the OS rather than breaking the page.
    return null;
  }
}

/**
 * The theme, and a way to change it.
 *
 * The attribute is already set on `<html>` by the inline script in index.html before first
 * paint, so this hook does not cause the initial theme — it only keeps React in step with it
 * and takes over on toggle. Both read the same rule, so they cannot disagree.
 */
export function useTheme(): { theme: ThemeName; toggle: () => void } {
  const [theme, setTheme] = useState<ThemeName>(() =>
    typeof window === 'undefined' ? 'light' : resolveTheme(storedChoice(), systemPrefersDark()),
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // A reader who has expressed no preference should follow their OS as it changes.
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (storedChoice() === null) setTheme(query.matches ? 'dark' : 'light');
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: ThemeName = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Not persisting is survivable; not switching is not.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
