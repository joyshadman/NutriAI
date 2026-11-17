import axe from 'axe-core';
import { expect } from 'vitest';

export type Theme = 'light' | 'dark';

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export async function expectAccessible(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(
    results.violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.html).join(', ')}`,
    ),
  ).toEqual([]);
}
