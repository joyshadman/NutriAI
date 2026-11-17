import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';
import { expectAccessible, setTheme } from './helpers';

describe('Button', () => {
  it('has an accessible name, shows a focus ring, and passes axe in both themes', async () => {
    const { container } = render(<Button>Save meal</Button>);
    const button = screen.getByRole('button', { name: 'Save meal' });

    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus-visible:ring-focus');

    for (const theme of ['light', 'dark'] as const) {
      setTheme(theme);
      await expectAccessible(container);
    }
  });

  it('activates with the keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save meal</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders as a link with asChild and never forwards button only attributes', () => {
    const { container } = render(
      <Button asChild disabled>
        <a href="/meals">Meals</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Meals' });

    expect(link).not.toHaveAttribute('disabled');
    expect(link).not.toHaveAttribute('aria-busy');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveClass('rounded-control', 'bg-accent');
    return expectAccessible(container);
  });

  it('exposes loading and disabled states', () => {
    const { rerender } = render(<Button loading>Saving</Button>);
    let button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg')).toBeInTheDocument();

    rerender(<Button disabled>Save meal</Button>);
    button = screen.getByRole('button', { name: 'Save meal' });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-busy');
  });

  it('applies every variant and size from tokens', () => {
    const { container } = render(
      <>
        <Button variant="primary" size="sm">
          Primary
        </Button>
        <Button variant="secondary" size="md">
          Secondary
        </Button>
        <Button variant="ghost" size="lg">
          Ghost
        </Button>
        <Button variant="danger">Danger</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass(
      'bg-accent',
      'px-3',
    );
    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveClass(
      'border-border',
      'bg-surface-raised',
    );
    expect(screen.getByRole('button', { name: 'Ghost' })).toHaveClass(
      'bg-transparent',
      'px-6',
    );
    expect(screen.getByRole('button', { name: 'Danger' })).toHaveClass(
      'bg-danger',
    );
    return expectAccessible(container);
  });
});
