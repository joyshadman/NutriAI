import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

const gaps = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
  section: 'gap-section',
};

const directions = {
  row: 'flex-row',
  column: 'flex-col',
};

const alignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifications = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

type StackProps = ComponentPropsWithoutRef<'div'> & {
  direction?: keyof typeof directions;
  gap?: keyof typeof gaps;
  align?: keyof typeof alignments;
  justify?: keyof typeof justifications;
};

export function Stack({
  direction = 'column',
  gap = '4',
  align = 'stretch',
  justify = 'start',
  className,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        directions[direction],
        gaps[gap],
        alignments[align],
        justifications[justify],
        className,
      )}
      {...rest}
    />
  );
}
