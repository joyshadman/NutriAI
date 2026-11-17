# lib

## Overview

Server side building blocks for CalorieMeter AI. Each folder wraps one external service behind a small module, so routes and server actions call a helper instead of a vendor SDK directly.

## Key files

| File | Owns |
|---|---|
| `lib/env.ts` | `requireEnv`, `optionalEnv`, `numberEnv`, and `MissingEnvError` for readable config failures |
| `lib/db/index.ts` | Neon HTTP client wrapped in Drizzle |
| `lib/db/schema.ts` | Drizzle tables: users, sessions, accounts, verifications, meals, goals |
| `lib/auth/index.ts` | Better Auth config, Google provider, Drizzle adapter |
| `lib/auth/session.ts` | `getSession()` for server components and route handlers |
| `lib/ai/index.ts` | `AI_MODELS` and `withModelFallback` over OpenRouter |
| `lib/rate-limit.ts` | Upstash fixed window limiter, client IP, rate limit headers |
| `lib/storage.ts` | Meal photo validation, upload, and delete on Vercel Blob |
| `lib/validators/` | Zod schemas for request bodies and forms |

## Conventions

- Read config through `lib/env.ts`. Throw `MissingEnvError` at the point of use, never at import time, so the app boots without every service configured.
- Keep vendor SDK calls inside this folder. Routes and components call these helpers.
- Every schema lives in `lib/validators/` and is reused by routes and forms.
- Keep server only code here. Nothing in `lib/` imports a client component.

## Gotchas

- Better Auth needs `usePlural: true` in the Drizzle adapter, because the tables are plural (`users`, `sessions`). Without it every query looks for a singular table.
- Better Auth requires `users.emailVerified`. Drop that column and the build logs a schema mismatch.
- The AI SDK is v7. Use `output: Output.object({ schema })` for structured replies and `{ type: 'file', mediaType, data }` for image parts. The older `{ type: 'image' }` part is deprecated.
- `rateLimit` fails open when `UPSTASH_REDIS_REST_URL` or its token is unset. That keeps local development working, so never assume a limit is enforced in a test.
- Meal photos upload with `access: 'public'`. Anything private needs a different access mode and a signed read path.

## Related specs

- [0001. Stack & architecture](../docs/specs/_root/0001-stack-and-architecture/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
