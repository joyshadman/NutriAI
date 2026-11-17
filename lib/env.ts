/**
 * Small helpers for reading configuration from the environment.
 *
 * The app must boot without every optional service configured, so these
 * throw a clear, actionable error at the moment a feature is used instead of
 * crashing at import time.
 */

export class MissingEnvError extends Error {
  constructor(public readonly key: string) {
    super(
      `Missing required environment variable ${key}. Copy .env.example to .env.local and fill it in.`,
    );
    this.name = 'MissingEnvError';
  }
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new MissingEnvError(key);
  }
  return value;
}

export function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value ? value : fallback;
}

export function numberEnv(key: string, fallback: number): number {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
