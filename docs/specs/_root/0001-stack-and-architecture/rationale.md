# 0001. Stack & architecture · rationale

**Date**: 2026-10-24

## Context

The product is a healthy calories meter AI to help people lose weight. Track meals, get AI powered suggestions, and build lasting habits. This is a new greenfield product with a minimal Next.js scaffold already present. The foundation features must be decided first so later slices (auth, tracking, AI suggestions, goals, history) can build on a stable base. Early use is expected to be small (under 10k) with privacy by default (global, GDPR style). The team wants to ship fast with minimal ops burden.

## Options considered

### Option 1: Supabase all in one (Database, Auth, Storage)
**Pros**:
- One vendor for Postgres with Row Level Security, built in Auth, and storage
- Many Next.js examples and quick to set up
- Generated types and SSR helpers reduce boilerplate

**Cons**:
- Locks the product to the Supabase platform more tightly
- Less flexibility if we want to swap components later
- Some features cost more as usage grows

### Option 2: Neon plus Better Auth plus Vercel Blob (chosen)
**Pros**:
- Postgres stays flexible with Neon, and Drizzle gives us SQL first control
- Better Auth is open source and TypeScript first, easy to keep private
- Vercel Blob handles meal photos cleanly with Vercel hosting
- OpenRouter lets us use free models with a cheap fallback and supports vision
- Fits a small launch with low ops overhead

**Cons**:
- More services to wire together than an all in one
- We must implement our own rate limiting and some glue code
- Need to set up email? But we chose Google only so no email sender needed for auth now

### Option 3: Prisma with Neon and Clerk
**Pros**:
- Prisma is mature and schema first with great migrations
- Clerk gives polished auth UI out of the box

**Cons**:
- Clerk adds a hosted auth cost and another vendor
- Prisma is heavier than Drizzle for this small app
- More dependencies than necessary for a tiny launch

## Rationale

For a tiny launch with privacy by default, the cleanest balance is a flexible Postgres (Neon) plus a self controlled auth layer (Better Auth) with Google only. Drizzle keeps the data layer simple and type safe. OpenRouter gives us room to try free models for both text suggestions and photo estimates with a fallback so we don't silently fail. Vercel Blob stores meal photos without putting blobs in the database. Vercel hosts the app with no same day surprises for Next.js 16. The small extra wiring is worth the flexibility and control at this scale.

## References

**Project sources** (verifiable, in this repo):
- `package.json` (Next.js 16.4.3, React 19.3.0)
- `next.config.ts` (App Router, cacheComponents, partialPrefetching)
- `AGENTS.md` (Next.js breaking changes notice)
- `docs/scope/scope.md` (feature list and approach Tracer Bullet)

**Practices & standards**:
- Row level security for user data
- Privacy by default (GDPR style export and delete)
- Server Actions with validation for writes
- Free tier quotas with fallbacks and rate limiting

**Links** (web verified only, sources+links level only):
- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Vercel AI SDK Docs](https://ai-sdk.dev/docs)
- [OpenRouter](https://openrouter.ai/docs)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs)
- [Vercel Docs (Next.js)](https://vercel.com/docs/frameworks/nextjs)
- [Upstash Redis](https://upstash.com/docs/redis)
- [Zod](https://zod.dev)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
