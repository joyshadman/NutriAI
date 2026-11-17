import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { ToastProvider, clearToasts, toast } from '@/components/ui/toast';
import { expectAccessible, setTheme } from './helpers';

afterEach(() => {
  clearToasts();
});

async function expectBothThemes() {
  for (const theme of ['light', 'dark'] as const) {
    setTheme(theme);
    await expectAccessible(document.body);
  }
}

describe('Dialog', () => {
  it('traps focus, closes with Escape, and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        title="Add meal"
        description="Log what you ate"
        trigger="Add meal"
      >
        <label htmlFor="meal-name">Meal name</label>
        <input id="meal-name" />
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Add meal' });

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Add meal' });
    expect(screen.getByText('Log what you ate')).toBeVisible();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeVisible();
    await expectBothThemes();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('DropdownMenu', () => {
  it('opens with the keyboard, navigates items, and closes with Escape', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <DropdownMenu
        trigger="Actions"
        items={[
          { label: 'Edit', onSelect: onEdit },
          { label: 'Delete', onSelect: onDelete, destructive: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeVisible();
    const firstItem = screen.getAllByRole('menuitem')[0];
    expect(firstItem).toHaveFocus();
    for (const theme of ['light', 'dark'] as const) {
      setTheme(theme);
      await expectAccessible(screen.getByRole('menu'));
    }

    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(await screen.findByRole('menu')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });
});

describe('Toast', () => {
  it('announces through a named live region and exposes both variants', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <button onClick={() => toast('Meal saved', { duration: 60000 })}>
          Save
        </button>
        <button
          onClick={() =>
            toast('Could not save', { variant: 'error', duration: 60000 })
          }
        >
          Fail
        </button>
      </ToastProvider>,
    );

    expect(
      document.querySelector('[aria-label="Notifications"]'),
    ).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Meal saved')).toBeVisible();
    expect(document.querySelector('[role="status"]')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Fail' }));
    expect(await screen.findByText('Could not save')).toBeVisible();
    expect(document.querySelector('[role="alert"]')).not.toBeNull();

    const closeButtons = screen.getAllByRole('button', {
      name: 'Close notification',
    });
    expect(closeButtons.length).toBe(2);
    await expectBothThemes();
  });
});
