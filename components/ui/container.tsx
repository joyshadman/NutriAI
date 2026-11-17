import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
};

export function Container({ size = 'lg', className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
