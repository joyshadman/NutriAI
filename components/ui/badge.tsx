import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  variant?: 'neutral' | 'accent' | 'danger';
};

const variants = {
  neutral: 'border border-border bg-surface text-text-muted',
  accent: 'border border-accent bg-accent text-surface-raised',
  danger: 'border border-danger bg-danger text-surface-raised',
};

export function Badge({ variant = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-full px-2 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
