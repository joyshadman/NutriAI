# Verify: data model · spec 0002 · updated 2026-11-14
_Steps derived from spec 0002. `/check verify` runs these; `/test` locks the durable ones._

## Commands

- [ ] `npx drizzle-kit generate` then apply both migrations to a fresh or dropped Neon database → no errors → **AC-6**
- [ ] `npx tsc --noEmit` → exits 0 → **AC-6**
- [ ] `npm run build` → exits 0, no Better Auth schema mismatch → **AC-1**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c '\d+ meals'` → `local_date` is `date` and not null, `eaten_at` is `timestamptz`, checks present → **AC-1**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c '\d+ foods'` → unique index on `user_id`, `lower(btrim(name))`, `lower(btrim(serving))`, and `char_length` checks → **AC-3**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c '\d+ goals'` → unique index on `user_id` → **AC-1**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c "SELECT rolbypassrls FROM pg_roles WHERE rolname = '<app_role>'"` → `f` → **AC-5**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c "SELECT has_table_privilege('<app_role>', 'meals', 'SELECT')"` → `t`, and the same for `INSERT`, `UPDATE`, `DELETE` → **AC-5**

## SQL checks

Insert the fixture as the owner, since the app role cannot write without a user id. Then test as the app role (`DATABASE_URL`), since the owner bypasses policies.

- [ ] As the owner, insert users A and B, one meal and one item for each.
- [ ] As the app role: `BEGIN; SELECT set_config('app.user_id', '<A>', true); SELECT count(*) FROM meals;` → 1 → **AC-4**
- [ ] In the same transaction, `SELECT count(*) FROM meal_items;` → only A's items → **AC-4**
- [ ] In the same transaction, insert a meal with `user_id = '<B>'` → rejected by the write policy → **AC-4**
- [ ] `SELECT count(*) FROM meals;` with no user id set → 0 → **AC-4**
- [ ] Insert the same trimmed, lowercased name and serving twice for one user → the second raises a unique violation → **AC-3**
- [ ] Insert a meal item with `quantity = 0` → the check constraint rejects it → **AC-3**
- [ ] Insert a food with an empty name → the `char_length` check rejects it → **AC-3**
- [ ] Delete a food used by an item → the item remains, `food_id` is null, macros unchanged → **AC-7**
- [ ] Delete a user → that user's meals, meal items, foods, and goal are gone → **AC-7**

## App checks

- [ ] `withUser('', fn)` throws `MissingUserError` and runs no SQL → **AC-5**
- [ ] `withUser('not-a-uuid', fn)` throws `InvalidUserError` and runs no SQL → **AC-5**
- [ ] `computeLocalDate(new Date('2026-11-11T23:30:00Z'), 'Asia/Tokyo')` → `2026-11-12` → **AC-2**
- [ ] `computeLocalDate(new Date(), 'Not/AZone')` throws `InvalidTimezoneError` → **AC-2**
- [ ] A day total query through `withUser` joins `meal_items` to `meals`, groups by `local_date`, casts the sum to `int`, and returns the expected number → **AC-1**, **AC-2**
- [ ] An item with a null `food_id` still counts in the day total → **AC-1**

## Acceptance-criteria coverage

- **AC-1**: schema commands and the day total query.
- **AC-2**: the local date helper, the invalid zone case, and the day total query.
- **AC-3**: the unique food, check constraint, and empty name steps.
- **AC-4**: the SQL checks under the app role, including the write policy.
- **AC-5**: the role bypass, grants, and helper steps.
- **AC-6**: the generate, typecheck, and build steps.
- **AC-7**: the delete steps.

## Added by /develop · 2026-11-14

The app role is named `nutriai_app`. Use it wherever a step above says `<app_role>`.
`db/migrations/0000_init_data_model.sql` is generated from `lib/db/schema.ts`;
`db/migrations/0001_rls_policies.sql` creates the role, grants, policies, and the
bypass assertion.

- [ ] `npm run db:generate` → reports no schema changes, so the checks and the
  food expression index are not treated as drift → **AC-1**, **AC-3**
- [ ] `npm run db:migrate` with `MIGRATION_DATABASE_URL` set → both migrations
  apply in order with no error → **AC-6**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c '\d+ users'` → `timezone` defaults to
  `UTC`, `units` defaults to `metric`, and the units check exists → **AC-1**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"` → `meals`, `meal_items`, `foods`, and `goals` show `t`; the Better Auth tables show `f` → **AC-4**
- [ ] `psql "$MIGRATION_DATABASE_URL" -c "SELECT polname, polcmd FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid WHERE c.relname IN ('meals','meal_items','foods','goals')"` → one `ALL` policy per table → **AC-4**
- [ ] `env -u DATABASE_URL npx tsx -e "import('./lib/auth/index').then(() => console.log('booted'))"` → prints `booted`, so the app imports without a database configured → **AC-5**

