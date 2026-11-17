'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: string | boolean;
  label?: string;
  name?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
};

const triggerBase =
  'inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-control border border-border bg-surface-raised px-3 text-base text-text transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-text-muted';

const contentBase =
  'z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card border border-border bg-surface-raised shadow-card';

const itemBase =
  'relative flex min-h-11 cursor-default select-none items-center rounded-control px-3 pr-8 text-base text-text outline-none data-[highlighted]:bg-surface data-[state=checked]:font-medium data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50';

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  error,
  label,
  name,
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const invalid = Boolean(error);
  const errorId =
    invalid && typeof error === 'string' ? `${controlId}-error` : undefined;

  return (
    <>
      {label ? (
        <label
          htmlFor={controlId}
          className="mb-1 block text-sm font-medium text-text"
        >
          {label}
        </label>
      ) : null}
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        <SelectPrimitive.Trigger
          id={controlId}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={errorId}
          className={cn(
            triggerBase,
            invalid && 'border-danger focus-visible:ring-danger',
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown aria-hidden="true" className="size-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={contentBase}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={itemBase}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2">
                    <Check aria-hidden="true" className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {typeof error === 'string' ? (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}
