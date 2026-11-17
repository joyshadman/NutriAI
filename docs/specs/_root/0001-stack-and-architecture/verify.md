# Verify: stack & architecture · spec 0001 · updated 2026-11-11
_Steps derived from spec 0001. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Sign in with Google, then `GET /api/auth/get-session` returns the user → Done when (needs Neon and Google keys)
- [ ] Upload a photo through the storage helper, then open the returned URL → blob wiring (needs `BLOB_READ_WRITE_TOKEN`)

## Commands

- [x] `npm run build` → exits 0, no Better Auth schema or secret errors → Done when
- [x] `npx tsc --noEmit` → exits 0 → Done when
- [x] `curl -s http://localhost:3000/api/auth/ok` → `{"ok":true}` → auth route reachable
- [ ] `POST /api/ai/suggest` with `{"prompt":"a healthy lunch"}` → 200 with `suggestion` → AI wiring
- [x] `POST /api/ai/suggest` with `{}` → 400 → request validation
- [ ] `POST /api/ai/estimate` with a JPEG under `image` → 200 with `estimate.name`, `calories`, `protein`, `carbs`, `fat` → vision plus structured output
- [x] `POST /api/ai/estimate` with a text file → 400 → photo validation
- [ ] 21 calls to `/api/ai/suggest` inside 60 seconds with Upstash configured → the 21st returns 429 with `Retry-After` → rate limiting

## Acceptance-criteria coverage

Spec 0001 has no numbered acceptance criteria. The contract is the scope's `Done when` line: the stack is recorded in a spec and the empty scaffold boots locally and passes build. Steps 1 and 2 cover that. The remaining steps cover each service the scaffold wires.
