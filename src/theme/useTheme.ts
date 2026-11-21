import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { ThemeName } from './tokens';

export const THEME_STORAGE_KEY = 'wcag-encyclopedia:theme';

export type StoredChoice = ThemeName | null;

/**
 * What theme should be shown, given what the reader chose and what their OS says.
 *
 * Pure, so the rule is testable without a browser. The rule itself is one line, but it is the
 * one people get wrong: **an explicit choice wins in both directions.** A reader on a dark OS
 * who picks light must get light on their next visit. The common bug is to treat the stored
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
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

function storedChoice(): StoredChoice {
  try {
    return readChoice(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // Private browsing, disabled storage: fall back to the OS rather than breaking the page.
    return null;
  }
}

/*
 * The theme lives on `<html data-theme>`. The inline script in the page template sets it
 * before first paint, so CSS is right before any JavaScript runs; React reads it as an
 * external store rather than owning a copy. That keeps hydration honest: the server cannot
 * know the reader's theme, so it renders the light snapshot, and React swaps to the real one
 * straight after hydrating instead of leaving a mismatched `aria-pressed` behind.
 */
const listeners = new Set<() => void>();

function current(): ThemeName {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' || attr === 'light' ? attr : resolveTheme(storedChoice(), systemPrefersDark());
}

function apply(theme: ThemeName) {
  document.documentElement.setAttribute('data-theme', theme);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The theme, and a way to change it. Safe to render on the server. */
export function useTheme(): { theme: ThemeName; toggle: () => void } {
  const theme = useSyncExternalStore<ThemeName>(subscribe, current, () => 'light');

  // A reader who has expressed no preference follows their OS as it changes.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (storedChoice() === null) apply(query.matches ? 'dark' : 'light');
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeName = current() === 'dark' ? 'light' : 'dark';
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Not persisting is survivable; not switching is not.
    }
    apply(next);
  }, []);

  return { theme, toggle };
}
