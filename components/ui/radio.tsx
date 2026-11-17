'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { useId } from 'react';
import { cn } from '@/lib/cn';

type RadioItem = {
  value: string;
  label: string;
};

type RadioProps = {
  items: RadioItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  label?: string;
  error?: string | boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

export function Radio({
  items,
  value,
  onValueChange,
  name,
  label,
  error,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: RadioProps) {
  const generatedId = useId();
  const groupId = `radio-${generatedId}`;
  const labelId = `${groupId}-label`;
  const invalid = Boolean(error);
  const errorId =
    invalid && typeof error === 'string' ? `${groupId}-error` : undefined;

  return (
    <>
      {label ? (
        <span id={labelId} className="mb-1 block text-sm font-medium text-text">
          {label}
        </span>
      ) : null}
      <RadioGroupPrimitive.Root
        id={groupId}
        value={value}
        onValueChange={onValueChange}
        name={name}
        disabled={disabled}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={errorId}
        className={cn('flex flex-col gap-2', className)}
      >
        {items.map((item) => {
          const itemId = `${groupId}-${item.value}`;
          return (
            <div key={item.value} className="flex items-center gap-2">
              <RadioGroupPrimitive.Item
                id={itemId}
                value={item.value}
                className={cn(
                  'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent',
                  invalid && 'border-danger focus-visible:ring-danger',
                )}
              >
                <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-accent" />
              </RadioGroupPrimitive.Item>
              <label htmlFor={itemId} className="text-base text-text">
                {item.label}
              </label>
            </div>
          );
        })}
      </RadioGroupPrimitive.Root>
      {typeof error === 'string' ? (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}
