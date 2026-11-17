'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { useSyncExternalStore, type ReactNode } from 'react';

type ToastVariant = 'info' | 'error';

type ToastOptions = {
  variant?: ToastVariant;
  duration?: number;
};

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
};

let nextId = 0;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const emptyItems: ToastItem[] = [];

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return items;
}

function getServerSnapshot() {
  return emptyItems;
}

export function toast(message: string, options: ToastOptions = {}) {
  const id = ++nextId;
  items = [
    ...items,
    {
      id,
      message,
      variant: options.variant ?? 'info',
      duration: options.duration ?? 5000,
    },
  ];
  emit();
  return id;
}

export function dismissToast(id: number) {
  items = items.filter((item) => item.id !== id);
  emit();
}

export function clearToasts() {
  items = [];
  emit();
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const active = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {children}
      {active.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          duration={item.duration}
          onOpenChange={(open) => {
            if (!open) dismissToast(item.id);
          }}
          className="flex items-center justify-between gap-4 rounded-card border border-border bg-surface-raised p-4 text-base text-text shadow-card"
        >
          {item.variant === 'error' ? (
            <div role="alert">
              <ToastPrimitive.Title className="font-medium">
                {item.message}
              </ToastPrimitive.Title>
            </div>
          ) : (
            <ToastPrimitive.Title className="font-medium">
              {item.message}
            </ToastPrimitive.Title>
          )}
          <ToastPrimitive.Close
            aria-label="Close notification"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
          >
            <X aria-hidden="true" className="size-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport
        aria-label="Notifications"
        className="fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none"
      />
    </ToastPrimitive.Provider>
  );
}
