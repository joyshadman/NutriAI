'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = Omit<
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  'children'
> & {
  label: string;
  error?: string | boolean;
};

export function Checkbox({
  label,
  error,
  id,
  className,
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const invalid = Boolean(error);
  const errorId =
    invalid && typeof error === 'string' ? `${controlId}-error` : undefined;

  return (
    <>
      <div className="flex items-start gap-2">
        <CheckboxPrimitive.Root
          id={controlId}
          aria-invalid={invalid || undefined}
          aria-describedby={errorId}
          className={cn(
            'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-control border border-border bg-surface-raised text-surface-raised transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent',
            invalid && 'border-danger focus-visible:ring-danger',
            className,
          )}
          {...rest}
        >
          <CheckboxPrimitive.Indicator>
            <Check aria-hidden="true" className="size-4" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <label htmlFor={controlId} className="text-base text-text">
          {label}
        </label>
      </div>
      {typeof error === 'string' ? (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}
