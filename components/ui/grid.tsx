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

const columns = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const smColumns = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

const lgColumns = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

type GridProps = ComponentPropsWithoutRef<'div'> & {
  columns?: keyof typeof columns;
  gap?: keyof typeof gaps;
  smColumns?: keyof typeof smColumns;
  lgColumns?: keyof typeof lgColumns;
};

export function Grid({
  columns: count = 1,
  gap = '4',
  smColumns: smallCount,
  lgColumns: largeCount,
  className,
  ...rest
}: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        columns[count],
        gaps[gap],
        smallCount && smColumns[smallCount],
        largeCount && lgColumns[largeCount],
        className,
      )}
      {...rest}
    />
  );
}
