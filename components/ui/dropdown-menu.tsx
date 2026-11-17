'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DropdownItem = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

type DropdownMenuProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'center' | 'end';
  className?: string;
};

const fallbackTriggerClass =
  'inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface-raised px-4 text-base font-medium text-text transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

const contentClass =
  'z-50 min-w-44 rounded-card border border-border bg-surface-raised p-1 shadow-card';

export function DropdownMenu({
  trigger,
  items,
  align = 'start',
  className,
}: DropdownMenuProps) {
  const triggerNode =
    typeof trigger === 'string' || typeof trigger === 'number' ? (
      <button type="button" className={fallbackTriggerClass}>
        {trigger}
      </button>
    ) : (
      trigger
    );

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {triggerNode}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={4}
          className={cn(contentClass, className)}
        >
          {items.map((item) => (
            <DropdownMenuPrimitive.Item
              key={item.label}
              onSelect={item.onSelect}
              disabled={item.disabled}
              className={cn(
                'relative flex min-h-11 cursor-default items-center rounded-control px-3 text-base text-text outline-none select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-surface',
                item.destructive &&
                  'text-danger data-[highlighted]:bg-danger data-[highlighted]:text-surface-raised',
              )}
            >
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
