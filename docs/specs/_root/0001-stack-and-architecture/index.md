# 0001. Stack & architecture

**Date**: 2026-10-24
**Status**: In Progress

## Summary

This sets the foundation for CalorieMeter AI: Next.js 16 with React 19 on the web, Neon Postgres with Drizzle, Better Auth (Google only), OpenRouter for AI suggestions and photo estimates, Vercel Blob for meal photos, and Vercel for hosting. The stack is chosen for a small launch (just me and friends) with privacy by default and minimal moving parts. All of this keeps the project simple to build and operate while still supporting the features in scope.

## Requirements

**Done when:** the stack is recorded in a spec and the empty scaffold boots locally and passes build.

This is a foundation decision, so it carries no numbered acceptance criteria. The verify steps live in [verify.md](verify.md).

## Decision

**Chosen option**: Option 2: Neon plus Better Auth plus Vercel Blob

**Implementation skills**: none installed. The skills in `.agents/skills/` are workflow skills (`architect`, `develop`, `check`, and so on), not stack skills.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript | Strict types, great with Next.js and React 19 |
| Framework | Next.js 16.4.3 (App Router) | Already scaffolded, strong DX, Server Components and Server Actions fit the chosen API shape |
| Primary DB | Neon Postgres | Serverless Postgres, region can be set to India and South Asia for early users |
| ORM / Query | Drizzle ORM | SQL first, lightweight, pairs well with Neon and Better Auth |
| Auth | Better Auth (Google OAuth only) | Open source, TypeScript first, no email verification or password reset flows needed for Google only |
| File storage | Vercel Blob | Simple for meal photos, integrates well with Vercel hosting |
| AI | OpenRouter (Vercel AI SDK v5) | Free models first with cheap fallback; supports text and vision |
| Rate limiting | Upstash Redis | Per user and per IP limits on AI endpoints and auth attempts |
| Validation | Zod | Works well with Server Actions and forms |
| Hosting | Vercel | First class Next.js 16 support, previews, minimal ops |
| Testing | Vitest plus Playwright | Unit and integration with Vitest, end to end with Playwright |
| Observability | None yet | Keep simple for now, can add later if needed |

## Build plan

- [x] Scaffold Next.js with the chosen services wired
- [x] Add auth, DB, and AI wiring
- [x] Set up blob storage and rate limiting

## Consequences

**Positive**:
- Minimal vendor lock in for core data and auth
- Can use free AI models with guardrails to avoid spend
- Clear path for meal photos (display and AI estimated)
- Easy to run locally and deploy with small ops burden

**Negative / tradeoffs**:
- More services to configure than an all in one (Neon, Better Auth, OpenRouter, Vercel Blob, Upstash)
- Must implement and maintain rate limiting and error handling ourselves
- Photo estimation depends on free vision models which may be slower or less accurate

**Neutral**:
- Google only sign in simplifies auth but limits sign in methods for now
- No monitoring yet means we need to be more careful with logging and debugging

## Follow-up

- [ ] Set up Neon database in India/South Asia region
- [ ] Configure Better Auth with Google OAuth only (disable email flows)
- [ ] Set up Drizzle schema and migrations
- [ ] Configure OpenRouter with free models and cheap fallback; add vision for photos
- [ ] Set up Vercel Blob for meal photos
- [ ] Set up Upstash Redis for rate limiting
- [ ] Add Vitest and Playwright test setup
- [ ] Consider adding Sentry later if errors become frequent

## Rationale

See [rationale.md](rationale.md) for the context, the options weighed, and the references.
