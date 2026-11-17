'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  trigger?: ReactNode;
  children: ReactNode;
  className?: string;
};

const fallbackTriggerClass =
  'inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-4 text-base font-medium text-surface-raised transition-colors hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  className,
}: DialogProps) {
  const triggerNode =
    typeof trigger === 'string' || typeof trigger === 'number' ? (
      <button type="button" className={fallbackTriggerClass}>
        {trigger}
      </button>
    ) : (
      trigger
    );

  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {triggerNode ? (
        <DialogPrimitive.Trigger asChild>{triggerNode}</DialogPrimitive.Trigger>
      ) : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-surface opacity-80 transition-opacity duration-[var(--duration-overlay)]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface-raised p-4 shadow-card',
            className,
          )}
        >
          <DialogPrimitive.Title className="text-xl font-semibold text-text">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-sm text-text-muted">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          <div className="mt-4">{children}</div>
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
          >
            <X aria-hidden="true" className="size-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
