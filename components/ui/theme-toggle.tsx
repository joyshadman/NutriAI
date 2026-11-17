'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
} from 'react';
import { cn } from '@/lib/cn';

type ThemeChoice = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'cm-theme';
const ORDER: ThemeChoice[] = ['system', 'light', 'dark'];
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {}
  return 'system';
}

function getSnapshot() {
  return readChoice();
}

function getServerSnapshot() {
  return 'system' as const;
}

function writeChoice(choice: ThemeChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {}
  emit();
}

function applyChoice(choice: ThemeChoice) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = choice === 'dark' || (choice === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

type ThemeToggleProps = Omit<ComponentPropsWithoutRef<'button'>, 'onClick'>;

export function ThemeToggle({ className, ...rest }: ThemeToggleProps) {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useIsomorphicLayoutEffect(() => {
    applyChoice(choice);
  }, [choice]);

  useEffect(() => {
    if (choice !== 'system') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyChoice('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [choice]);

  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
  const label =
    next === 'light'
      ? 'Switch to light theme'
      : next === 'dark'
        ? 'Switch to dark theme'
        : 'Switch to system theme';
  const Icon = choice === 'system' ? Monitor : choice === 'light' ? Sun : Moon;

  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      onClick={() => {
        writeChoice(next);
        applyChoice(next);
      }}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-control border border-border bg-surface-raised text-text transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}
