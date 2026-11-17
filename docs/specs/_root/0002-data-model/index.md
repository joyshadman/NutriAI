# 0002. Data model

**Date**: 2026-11-11
**Status**: In Progress

## Summary

This sets the database every later slice builds on. Meals hold items, each item snapshots its calories and macros, foods form a catalog per user, and one goal row per user holds the daily target. A day's total is computed from the items and never stored, and Postgres row level security keeps each person's rows private.

## Requirements

**User stories**:
- As a person tracking meals, I want my meals, foods, and goal tied to my account so that nobody else can read or change them.
- As the person building later slices, I want one schema and one policy set so that AI suggestions, goals, and history build without a breaking migration.

**Acceptance criteria**:
- **AC-1**: The schema has the entities, fields, keys, links, indexes, and checks in Feature design. There is no daily entries table. A day total is a query over meal items grouped by the meal's local date.
- **AC-2**: Each meal stores a local date, computed on the server from the eaten time and the user's timezone. A helper returns the correct calendar date across a day boundary, and a timezone change never rewrites a past local date.
- **AC-3**: Foods are unique per user on the trimmed, lowercased name plus the trimmed, lowercased serving. A duplicate insert is rejected by the unique index. Check constraints reject negative calories or macros, a quantity that is not greater than zero, and a name or serving outside 1 to 200 characters. Reusing an existing food is a write path rule for the calorie tracking slice, not this feature.
- **AC-4**: Row level security is enabled on meals, meal items, foods, and goals, and the policies cover reads and writes. With the user id set for a transaction, a session selects, inserts, updates, and deletes only its own rows, and a meal item resolves ownership through its parent meal.
- **AC-5**: The app connects as a role that does not own the tables and does not inherit `neon_superuser`. Every query against the protected tables runs through one helper that sets the user id for the transaction. The helper throws a typed error before any query when the user id is empty or not a UUID, and it runs on the Node runtime only.
- **AC-6**: One generated migration plus the policy migration apply cleanly to a fresh or dropped Neon database, and the Drizzle types compile with no `any`.
- **AC-7**: Deleting a user cascades their meals, meal items, foods, and goal. Deleting a food sets the item's food link to null and keeps the snapshot name, quantity, calories, and macros.

## Decision

**Chosen option**: Option 2: Meals with items, a per user food catalog, and policy based isolation

A meal is an event with items, each item snapshots its macros, foods are a per user catalog, and row level security runs through a non owner app role with the user id set per transaction.

**Implementation skills**: none installed. The skills in `.agents/skills/` are workflow skills (`architect`, `develop`, `check`, and so on), not stack skills.

## Feature design

**Data model sketch**:

`users` is owned by Better Auth. This feature adds `timezone` and `units` and leaves its timestamps as they are.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key, default random |
| `name` | text | nullable |
| `email` | text | required, unique |
| `email_verified` | boolean | required, default false |
| `image` | text | nullable |
| `timezone` | text | required, default `UTC`, an IANA zone name |
| `units` | text | required, default `metric`, check in (`metric`, `imperial`) |
| `created_at` | timestamp | required, default now |
| `updated_at` | timestamp | required, default now |

`sessions`, `accounts`, and `verifications` stay exactly as Better Auth defines them.

`meals` is the eating event.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key, default random |
| `user_id` | uuid | required, references `users.id`, cascade |
| `label` | text | nullable, an optional name such as `Chicken salad` |
| `meal_type` | text | required, check in (`breakfast`, `lunch`, `dinner`, `snack`) |
| `source` | text | required, default `manual`, check in (`manual`, `photo`, `ai_suggestion`) |
| `notes` | text | nullable |
| `eaten_at` | timestamptz | required, default now |
| `local_date` | date | required, the user's calendar date at write time |
| `photo_url` | text | nullable |
| `created_at` | timestamptz | required, default now |
| `updated_at` | timestamptz | required, default now |

`meal_items` holds one food on the plate and the snapshot of what it contributed.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key, default random |
| `meal_id` | uuid | required, references `meals.id`, cascade |
| `food_id` | uuid | nullable, references `foods.id`, set null on delete |
| `name` | text | required, the snapshot name |
| `quantity` | numeric(6,2) | required, default 1, check greater than 0 |
| `calories` | integer | required, check 0 or more, the total for this quantity |
| `protein` | numeric(6,1) | nullable, check 0 or more |
| `carbs` | numeric(6,1) | nullable, check 0 or more |
| `fat` | numeric(6,1) | nullable, check 0 or more |
| `created_at` | timestamptz | required, default now |

Items are immutable snapshots. Editing a meal deletes and reinserts its items, so a later food edit never rewrites a past item. A quantity change on an existing item goes through the same replace path.

`foods` is the per user catalog.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key, default random |
| `user_id` | uuid | required, references `users.id`, cascade |
| `name` | text | required, trimmed, `char_length` between 1 and 200 |
| `serving` | text | required, trimmed, `char_length` between 1 and 200, for example `100 g` or `1 cup` |
| `calories` | integer | required, check 0 or more, per serving |
| `protein` | numeric(6,1) | nullable, check 0 or more, per serving |
| `carbs` | numeric(6,1) | nullable, check 0 or more, per serving |
| `fat` | numeric(6,1) | nullable, check 0 or more, per serving |
| `created_at` | timestamptz | required, default now |
| `updated_at` | timestamptz | required, default now |

`goals` holds the one active goal per user.

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key, default random |
| `user_id` | uuid | required, references `users.id`, cascade, unique |
| `daily_calories` | integer | required, check greater than 0 |
| `protein_target` | numeric(6,1) | nullable, check 0 or more |
| `carbs_target` | numeric(6,1) | nullable, check 0 or more |
| `fat_target` | numeric(6,1) | nullable, check 0 or more |
| `created_at` | timestamptz | required, default now |
| `updated_at` | timestamptz | required, default now |

**Relationships**:

| From | To | Cardinality | On delete |
|---|---|---|---|
| `users` | `meals` | 1 to many | cascade |
| `users` | `foods` | 1 to many | cascade |
| `users` | `goals` | 1 to 1 | cascade |
| `users` | `sessions`, `accounts` | 1 to many | cascade |
| `meals` | `meal_items` | 1 to many | cascade |
| `foods` | `meal_items` | 1 to many, optional | set null |

**Indexes and constraints**:
- `meals`: index on (`user_id`, `local_date`).
- `meal_items`: index on `meal_id` and on `food_id`.
- `foods`: index on `user_id`, and a unique expression index on (`user_id`, `lower(btrim(name))`, `lower(btrim(serving))`).
- `goals`: unique index on `user_id`.
- Check constraints listed in the tables above.
- The unique expression index and every check constraint live in `lib/db/schema.ts` with `uniqueIndex().on(sql...)` and `check()`, so `drizzle-kit generate` keeps them and never drops them as drift.
- No soft delete columns. Deletes are hard, and the item snapshot keeps history.

**State transitions**: no state machine. A goal row is created or updated in place. A meal is created, edited, or deleted. Meal items are immutable, and an edit replaces them.

**API surface**:

No HTTP endpoints in this feature. The surface is the module exports the later slices call:

| Export | Shape | Auth | Key errors |
|---|---|---|---|
| `db` | Drizzle client over a Neon Pool, reserved for Better Auth and never used for protected app data | server only | connection failure |
| `withUser(userId, fn)` | validates the UUID, opens `db.transaction`, runs `set_config('app.user_id', userId, true)`, then calls `fn(tx)` with a typed transaction | server only, Node runtime only, requires a session user | `MissingUserError`, `InvalidUserError` |
| `computeLocalDate(eatenAt, timezone)` | takes a `Date` and an IANA zone, returns `YYYY-MM-DD` | pure function | `InvalidTimezoneError` |
| schema tables and relations | Drizzle table objects, including checks and the expression index | server only | none |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Log a meal | local date | `computeLocalDate(eaten_at, users.timezone)` |
| Edit a meal's eaten time | recomputed local date | `computeLocalDate(new eaten_at, users.timezone)`, never a rewrite on a timezone change |
| Log a meal item | calories, protein, carbs, fat snapshot | the linked `foods` row times `quantity`, rounded to one decimal for macros, or direct input for a free text item |
| Show a day total | total calories and macros | `sum(meal_items.calories)` and macro sums over `meal_items JOIN meals ON meal_items.meal_id = meals.id`, grouped by `meals.local_date`, with no `foods` join |
| List a day | meals for the user's local day | `meals` filtered by `user_id` and `local_date`, using the (`user_id`, `local_date`) index |
| Resolve ownership | current user id | the session user id passed to `withUser`, set as the transaction user id |
| Show a goal | daily calories and macro targets | the `goals` row for the user, or null when no row exists |
| Show units | metric or imperial | `users.units` |
| Choose a meal type | breakfast, lunch, dinner, snack | request input validated by Zod, stored on `meals.meal_type` |
| Choose a source | manual, photo, ai_suggestion | request input validated by Zod, stored on `meals.source` |

**Key invariants**:
- A meal belongs to exactly one user, and an item belongs to exactly one meal.
- An item's calories and macros are a snapshot at log time and are never recomputed from the food after insert.
- Meal items are immutable. Editing a meal deletes and reinserts its items.
- A meal has at least one item. The calorie tracking write path enforces this.
- A food name and serving pair is unique per user after trimming and ignoring case.
- When an item links a food, that food belongs to the same user as the meal. The calorie tracking write helper reads the food inside the same transaction and throws `CrossUserFoodError` when it does not match.
- A user has at most one goal row.
- Deleting a user deletes their meals, items, foods, and goal.
- `local_date` equals the calendar date of `eaten_at` in the user's timezone at write time. An edit that changes `eaten_at` recomputes it, and a timezone change never rewrites a past `local_date`.
- Calories and macros are never negative, and quantity is greater than zero.
- The day total is `sum(meal_items.calories)` over `meal_items JOIN meals` grouped by `meals.local_date`. It never joins `foods`, so items with a null food link still count.

**Security model**:
- Two roles: the Neon owner runs migrations, and a separate app role runs the app. The app role does not own the tables, and it must not inherit `neon_superuser`, which holds `BYPASSRLS`. The migration revokes that membership and asserts `rolbypassrls` is false.
- The app role gets `USAGE` on the `public` schema and `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on `users`, `sessions`, `accounts`, `verifications`, `meals`, `meal_items`, `foods`, and `goals`. Default privileges grant the same on future tables.
- RLS on `meals`, `foods`, and `goals`: `FOR ALL USING (user_id = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK (user_id = nullif(current_setting('app.user_id', true), '')::uuid)`.
- RLS on `meal_items`: `FOR ALL USING (EXISTS (SELECT 1 FROM meals m WHERE m.id = meal_id AND m.user_id = nullif(current_setting('app.user_id', true), '')::uuid)) WITH CHECK (the same EXISTS)`.
- Better Auth tables (`users`, `sessions`, `accounts`, `verifications`) have RLS off, because Better Auth queries them without a user context. App code still filters by the session user. The raw `db` export is reserved for Better Auth, and protected app data never uses it.
- No public access. Every query against the protected tables runs on the server through `withUser`, on the Node runtime.
- Meals and macros are personal health data. They leave the server only through an AI call the user triggers. This feature adds no audit log.

**Configuration required**:
- `DATABASE_URL`: the app role connection string, used by the running app.
- `MIGRATION_DATABASE_URL`: the owner connection string, used only by `drizzle-kit migrate`.
- `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BETTER_AUTH_URL` already exist and do not change.

**Critical test scenarios**:
- Happy path: create a user, a food, a meal with two items, and a goal, then read the day total through `withUser`. It equals the sum of the item calories, and the query joins items to meals with no foods join. Verifies **AC-1**, **AC-2**.
- Failure case: `withUser` called with an empty or malformed user id throws a typed error before any SQL runs. Verifies **AC-5**.
- Auth or permission: user A selects meal items for user B's meal and gets zero rows, and an insert that names user B is rejected by the write policy. Verifies **AC-4**.
- Role bypass: `SELECT rolbypassrls FROM pg_roles WHERE rolname = '<app_role>'` returns false. Verifies **AC-5**.
- Duplicate food: inserting the same trimmed, lowercased name and serving twice raises a unique violation. Verifies **AC-3**.
- Delete: deleting a food leaves the item with a null food link and intact macros, and deleting a user removes every child row. Verifies **AC-7**.
- Migration: generate and apply on a fresh or dropped branch, then typecheck and build. Verifies **AC-6**.

## Build plan

The build approach is Tracer Bullet. The thinnest end to end thread is a working app role connection that can run one query under a user context, then the schema thickens around it, then the policies and the migration land. No migration exists yet. The dev database is treated as disposable: drop or recreate it before the first apply, or baseline it if it already holds tables.

1. Swap `lib/db/index.ts` to `drizzle-orm/neon-serverless`. Add `ws` and set `neonConfig.webSocketConstructor = ws` before the `Pool` is built. Use a `Pool` with `max: 5` and `idleTimeoutMillis: 10_000`, and reuse it across dev hot reloads. Read `DATABASE_URL` through `lib/env.ts` without connecting at import. Keep raw `db` for Better Auth only. Add `withUser` (UUID validation, always `db.transaction`, `set_config('app.user_id', $1, true)`, typed `tx`) plus `MissingUserError` and `InvalidUserError`. Satisfies **AC-5**.
2. Extend `users` with `timezone` and `units`, and declare both in Better Auth `user.additionalFields` as `type: 'string'`, `required: false`, `input: true`, with defaults `UTC` and `metric`. Reshape `meals` into the event shape. Add `meal_items` and `foods`. Add the unique user index and macro targets to `goals`. Add relations, indexes, every check, and the unique expression index in `schema.ts`, with `numeric(..., { mode: 'number' })` for macros and quantity. Satisfies **AC-1**, **AC-2**, **AC-7**.
3. Add `lib/dates.ts` with `computeLocalDate` (a `Date` and an IANA zone, `Intl` in a try block, `en-CA` parts, `InvalidTimezoneError`) and `lib/validators/data-model.ts` with trimming plus the Zod bounds for meal types, sources, units, names, servings, calories, macros, and quantity. Satisfies **AC-2**, **AC-3**.
4. Run `drizzle-kit generate` and review the SQL. Confirm the checks and the expression index come from `schema.ts`, so no hand edit is needed for them. Satisfies **AC-1**, **AC-3**.
5. Add a hand written SQL migration after the generated one with the RLS policies (`FOR ALL USING` and `WITH CHECK`), the named grants, default privileges, `REVOKE neon_superuser` from the app role, and an assertion that the app role has no `BYPASSRLS`. Create the app role in the Neon console with its password out of the repo. Point `drizzle.config.ts` at `MIGRATION_DATABASE_URL` and add a `db:migrate` script. Satisfies **AC-4**, **AC-5**.
6. Drop or recreate the dev database, apply both migrations, confirm the live schema, then run `npm run typecheck` and `npm run build`. If the database already holds tables, baseline it instead of applying the generated `CREATE TABLE`. Satisfies **AC-6**.

## Consequences

**Positive**:
- One source of truth for a day total, with no rollup table to keep in sync.
- History never changes when a food is edited or deleted.
- Row level security is real defense in depth, not an app level promise.
- Goal history, AI suggestions, and body metrics can be added later without reshaping these tables.

**Negative or tradeoffs**:
- Two connection strings and a one time role setup before the app can run.
- Every protected query pays for a transaction and a user id setting.
- The app role must be checked for `BYPASSRLS`, or the policies are decorative.
- The meal items policy runs a subquery, so it is slower than a direct column check.
- Better Auth tables have no RLS, so an app code bug could read another user's profile row. Meal data stays protected.
- The database cannot enforce that a linked food belongs to the same user as the meal, so the calorie tracking write helper must check it.
- Meal items are immutable, so an edit replaces the rows and the original item ids are gone.
- The `users` table now mixes Better Auth columns with app preferences.

**Neutral**:
- The schema carries two timestamp types: `timestamp` on the Better Auth tables and `timestamptz` on the app tables.
- The dev database is dropped, recreated, or baselined before the first migration.
- `ws` becomes a dependency so the WebSocket driver works on Node 20.
- Macros use `numeric` with `mode: 'number'`, so they arrive as JavaScript numbers rather than strings.
- The day total casts its sum to `int`, which is enough for a day and not for a long range.

## Follow-up

- [ ] Create the app role in Neon and set `DATABASE_URL` and `MIGRATION_DATABASE_URL` before `/develop` can apply the migration.
- [ ] The onboarding slice sets `users.timezone` from the browser `Intl` zone and lets the user change it. Until it runs, the `UTC` default applies.
- [ ] The calorie tracking slice owns food reuse and the meal item write helpers, including the `CrossUserFoodError` check and the rule that a meal has at least one item.
- [ ] Revisit RLS on the `users` table once Better Auth can run with a user context or a privileged connection.
- [ ] Add audit logging when a later slice stores body metrics or other regulated health data.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
