import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Node 26 exposes an experimental global localStorage that shadows jsdom's.
const memory = new Map<string, string>();
const localStorageStub: Storage = {
  get length() {
    return memory.size;
  },
  clear: () => memory.clear(),
  getItem: (key) => memory.get(key) ?? null,
  key: (index) => Array.from(memory.keys())[index] ?? null,
  removeItem: (key) => {
    memory.delete(key);
  },
  setItem: (key, value) => {
    memory.set(key, String(value));
  },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageStub,
  configurable: true,
  writable: true,
});
Object.defineProperty(window, 'localStorage', {
  value: localStorageStub,
  configurable: true,
  writable: true,
});

class MatchMediaStub {
  matches = false;
  private listeners = new Set<(event: MediaQueryListEvent) => void>();

  addEventListener(
    _type: string,
    listener: (event: MediaQueryListEvent) => void,
  ) {
    this.listeners.add(listener);
  }

  removeEventListener(
    _type: string,
    listener: (event: MediaQueryListEvent) => void,
  ) {
    this.listeners.delete(listener);
  }

  setMatches(matches: boolean) {
    this.matches = matches;
    for (const listener of this.listeners) {
      listener({ matches } as MediaQueryListEvent);
    }
  }
}

export const darkPreference = new MatchMediaStub();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    if (query === '(prefers-color-scheme: dark)') return darkPreference;
    return new MatchMediaStub();
  },
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('dark');
  localStorage.clear();
  darkPreference.setMatches(false);
});
