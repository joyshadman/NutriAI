import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
    // The Drizzle tables are plural (users, sessions, accounts, verifications).
    usePlural: true,
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: baseURL ? [baseURL] : undefined,
  // App preferences live on `users` beside the Better Auth columns. The
  // defaults match the column defaults so a Google sign up works unchanged.
  user: {
    additionalFields: {
      timezone: {
        type: 'string',
        required: false,
        input: true,
        defaultValue: 'UTC',
      },
      units: {
        type: 'string',
        required: false,
        input: true,
        defaultValue: 'metric',
      },
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {},
  // Google only, per the stack decision. No email verification or password
  // reset flows, so no email sender is needed.
  emailAndPassword: {
    enabled: false,
  },
  // Must stay last: lets server actions set auth cookies.
  plugins: [nextCookies()],
});
