import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { themeScript } from '@/lib/theme-script';
import { darkPreference } from '../vitest.setup';
import { expectAccessible } from './helpers';

function runThemeScript() {
  new Function(themeScript)();
}

describe('theme wiring', () => {
  it('sets the class before paint for stored and device preferences', () => {
    localStorage.setItem('cm-theme', 'dark');
    runThemeScript();
    expect(document.documentElement).toHaveClass('dark');

    localStorage.setItem('cm-theme', 'light');
    runThemeScript();
    expect(document.documentElement).not.toHaveClass('dark');

    localStorage.clear();
    darkPreference.setMatches(true);
    runThemeScript();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('cycles system to light to dark and persists each choice', async () => {
    const user = userEvent.setup();
    const { container } = render(<ThemeToggle />);

    await user.click(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    );
    expect(localStorage.getItem('cm-theme')).toBe('light');
    expect(document.documentElement).not.toHaveClass('dark');

    await user.click(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    );
    expect(localStorage.getItem('cm-theme')).toBe('dark');
    expect(document.documentElement).toHaveClass('dark');

    await user.click(
      screen.getByRole('button', { name: 'Switch to system theme' }),
    );
    expect(localStorage.getItem('cm-theme')).toBe('system');
    expect(document.documentElement).not.toHaveClass('dark');
    await expectAccessible(container);
  });

  it('restores a stored choice on a fresh render', () => {
    localStorage.setItem('cm-theme', 'dark');
    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Switch to system theme' }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('follows the device live while the choice is system', () => {
    render(<ThemeToggle />);
    expect(document.documentElement).not.toHaveClass('dark');

    darkPreference.setMatches(true);
    expect(document.documentElement).toHaveClass('dark');

    darkPreference.setMatches(false);
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
