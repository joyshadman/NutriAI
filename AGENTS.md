<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack

- **Language / Runtime**: TypeScript 5 on Node 20 or newer
- **Framework**: Next.js 16.4.3 (App Router), React 19.3
- **Key dependencies**: Neon Postgres with Drizzle ORM, Better Auth (Google sign in only), OpenRouter through the Vercel AI SDK, Vercel Blob, Upstash Redis, Zod
- **Package manager**: npm

## Build approach

Tracer Bullet: vertical slices, each feature built end to end through every layer and working.

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build, also runs the TypeScript check
npm start            # serve the production build
npm run lint         # ESLint
npx tsc --noEmit     # type check only
```

## Specs

Stored in `docs/specs/_root/`, one directory per spec: `NNNN-title/index.md`, with `rationale.md` and `verify.md` beside it.

## Rules

- Keep TypeScript strict. Avoid `any` unless a third party type forces it.
- Read configuration through `lib/env.ts`. Never read `process.env` directly in feature code.
- Validate every request body, form, and Server Action input with Zod before it reaches the database or an AI call.
- Keep server secrets on the server. Only `NEXT_PUBLIC_*` values reach the browser.
- Import with the `@/*` alias, not deep relative paths.
- Server components by default. Add `'use client'` only where browser state or events need it.

## Git

- integration: on
- branch prefix: feat/
- commit: per milestone, Conventional Commits (`feat:`, `fix:`, `chore:`)

## Context files

- [lib/AGENTS.md](lib/AGENTS.md): service wiring and the invariants each service carries
