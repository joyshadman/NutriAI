import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type CardProps = ComponentPropsWithoutRef<'div'>;

export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface-raised shadow-card',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: CardProps) {
  return (
    <div className={cn('flex flex-col gap-1 p-4 pb-0', className)} {...rest} />
  );
}

export function CardTitle({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2 className={cn('text-xl font-semibold text-text', className)} {...rest}>
      {children}
    </h2>
  );
}

export function CardContent({ className, ...rest }: CardProps) {
  return <div className={cn('p-4 text-base text-text', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 p-4 pt-0', className)}
      {...rest}
    />
  );
}
