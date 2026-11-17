import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

type SpinnerProps = ComponentPropsWithoutRef<'span'> & {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

const sizes = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
};

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...rest
}: SpinnerProps) {
  const hidden = rest['aria-hidden'] === true;
  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      {...rest}
    >
      <svg
        className={cn('animate-spin', sizes[size])}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2Z"
        />
      </svg>
      {hidden ? null : <output className="sr-only">{label}</output>}
    </span>
  );
}
