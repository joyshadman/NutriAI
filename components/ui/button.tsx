import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/spinner';

type SharedButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
};

type ButtonProps = ComponentPropsWithoutRef<'button'> &
  SharedButtonProps &
  ({ asChild?: false; loading?: boolean } | { asChild: true; loading?: never });

const variants = {
  primary:
    'bg-accent text-surface-raised hover:bg-accent-strong active:brightness-95',
  secondary:
    'border border-border bg-surface-raised text-text hover:bg-surface active:brightness-95',
  ghost: 'bg-transparent text-text hover:bg-surface active:bg-border',
  danger:
    'bg-danger text-surface-raised hover:brightness-95 active:brightness-90',
};

const sizes = {
  sm: 'px-3 text-sm',
  md: 'px-4 text-base',
  lg: 'px-6 text-lg',
};

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const forwarded = asChild
    ? {
        'aria-disabled': disabled || loading || undefined,
        'data-loading': loading || undefined,
      }
    : {
        disabled: disabled || loading,
        'aria-busy': loading || undefined,
      };

  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      {...forwarded}
      {...rest}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Spinner aria-hidden /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}
