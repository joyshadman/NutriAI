import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

// drizzle-kit reads `.env`, but Next.js keeps local values in `.env.local`.
// Load both, with `.env.local` winning, so the migrate command picks up the
// owner connection string without exporting it by hand.
config({ path: ['.env.local', '.env'] });

export default {
  schema: './lib/db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // The owner connection string. The running app uses DATABASE_URL, which
    // belongs to a non owner role under row level security, so this never falls
    // back to it: migrate must run as the owner or the policies do not hold.
    url: process.env.MIGRATION_DATABASE_URL ?? '',
  },
} satisfies Config;
