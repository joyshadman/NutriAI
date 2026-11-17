import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'> & {
  size?: 'sm' | 'md' | 'lg';
  error?: string | boolean;
  loading?: boolean;
};

const sizes = {
  sm: 'min-h-10 px-3 py-1 text-sm',
  md: 'min-h-11 px-3 py-2 text-base',
  lg: 'min-h-12 px-4 py-2 text-lg',
};

const base =
  'w-full rounded-control border border-border bg-surface-raised text-text transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default';

export function Input({
  size = 'md',
  error,
  loading = false,
  id,
  name,
  className,
  ...rest
}: InputProps) {
  const invalid = Boolean(error);
  const errorId =
    invalid && typeof error === 'string' && (id || name)
      ? `${id || name}-error`
      : undefined;

  return (
    <>
      <input
        id={id}
        name={name}
        aria-invalid={invalid || undefined}
        aria-busy={loading || undefined}
        aria-describedby={cn(rest['aria-describedby'], errorId) || undefined}
        className={cn(
          base,
          sizes[size],
          invalid && 'border-danger focus-visible:ring-danger',
          className,
        )}
        {...rest}
      />
      {typeof error === 'string' ? (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}
