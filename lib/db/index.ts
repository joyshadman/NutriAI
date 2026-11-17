import { Pool, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { requireEnv } from '@/lib/env';
import * as schema from './schema';

/**
 * The app connects as a non owner role under row level security, so every
 * protected query needs the user id set for its transaction. This module keeps
 * two doors:
 *
 * - `db` is the raw client, reserved for Better Auth, which queries without a
 *   user context.
 * - `withUser` is the only door for app data. It validates the user id, opens a
 *   transaction, sets `app.user_id`, and hands the typed transaction to the
 *   caller.
 *
 * Both run on the Node runtime only: the Neon WebSocket driver needs `ws`.
 */

export class MissingUserError extends Error {
  constructor() {
    super('A session user id is required to query protected data.');
    this.name = 'MissingUserError';
  }
}

export class InvalidUserError extends Error {
  constructor(public readonly userId: string) {
    super(`"${userId}" is not a valid uuid user id.`);
    this.name = 'InvalidUserError';
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Database = ReturnType<typeof drizzle<typeof schema>>;

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

let pool: Pool | undefined;
let client: Database | undefined;

// The Pool is built on first use, not at import, so the app still boots when
// DATABASE_URL is unset. Dev hot reloads reuse it through the module cache.
function getPool(): Pool {
  if (!pool) {
    neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
    pool = new Pool({
      connectionString: requireEnv('DATABASE_URL'),
      max: 5,
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function getClient(): Database {
  if (!client) {
    client = drizzle(getPool(), { schema });
  }
  return client;
}

const lazilyConnectedClient = new Proxy({} as unknown as Database, {
  get(_target, property) {
    const real = getClient() as unknown as Record<PropertyKey, unknown>;
    const value = real[property];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

/**
 * Raw Drizzle client. Better Auth only. Protected app data goes through
 * `withUser`, never this client, because RLS has no user id to match.
 */
export const db = lazilyConnectedClient;

/**
 * Runs `fn` inside a transaction with `app.user_id` set, which is what the row
 * level security policies read. Throws before any SQL when the id is empty or
 * not a uuid.
 */
export async function withUser<T>(
  userId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  const trimmed = userId.trim();
  if (trimmed === '') {
    throw new MissingUserError();
  }
  if (!UUID_PATTERN.test(trimmed)) {
    throw new InvalidUserError(trimmed);
  }

  return getClient().transaction(async (tx) => {
    // `true` scopes the setting to the transaction, so a pooled connection
    // never leaks one user's id into the next request.
    await tx.execute(sql`select set_config('app.user_id', ${trimmed}, true)`);
    return fn(tx);
  });
}
