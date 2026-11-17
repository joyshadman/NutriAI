import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Radio } from '@/components/ui/radio';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { expectAccessible, setTheme } from './helpers';

async function expectBothThemes(container: HTMLElement) {
  for (const theme of ['light', 'dark'] as const) {
    setTheme(theme);
    await expectAccessible(container);
  }
}

describe('Input', () => {
  it('has a persistent label, keyboard focus, and an error tied to the field', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <label htmlFor="calories">Calories</label>
        <Input id="calories" error="Enter the calories" />
      </>,
    );
    const input = screen.getByLabelText('Calories');

    await user.tab();
    expect(input).toHaveFocus();
    await user.type(input, '450');
    expect(input).toHaveValue('450');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'calories-error');
    expect(screen.getByText('Enter the calories')).toBeVisible();
    await expectBothThemes(container);
  });
});

describe('Textarea', () => {
  it('has a persistent label, keyboard focus, and an error tied to the field', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" error="Add a note" />
      </>,
    );
    const field = screen.getByLabelText('Notes');

    await user.tab();
    expect(field).toHaveFocus();
    await user.type(field, 'Grilled chicken');
    expect(field).toHaveValue('Grilled chicken');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('aria-describedby', 'notes-error');
    await expectBothThemes(container);
  });
});

describe('Select', () => {
  it('opens and selects with the keyboard and exposes its name and error', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Select
        label="Meal"
        placeholder="Choose a meal"
        error="Pick a meal"
        onValueChange={onValueChange}
        options={[
          { value: 'breakfast', label: 'Breakfast' },
          { value: 'lunch', label: 'Lunch' },
          { value: 'dinner', label: 'Dinner', disabled: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Meal' });

    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-describedby');
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('option', { name: 'Lunch' })).toBeVisible();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalled();
    await expectBothThemes(container);
  });
});

describe('Checkbox', () => {
  it('toggles with Space, exposes its state, and passes axe in both themes', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox label="Include snacks" onCheckedChange={onCheckedChange} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Include snacks' });

    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expectBothThemes(container);
  });
});

describe('Radio', () => {
  it('exposes the group name and moves between items with arrow keys', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Radio
        label="Meal type"
        name="meal-type"
        onValueChange={onValueChange}
        items={[
          { value: 'breakfast', label: 'Breakfast' },
          { value: 'lunch', label: 'Lunch' },
        ]}
      />,
    );
    const group = screen.getByRole('radiogroup', { name: 'Meal type' });
    expect(group).toBeInTheDocument();

    const breakfast = screen.getByRole('radio', { name: 'Breakfast' });
    await user.click(breakfast);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Lunch' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith('lunch');
    await expectBothThemes(container);
  });
});
