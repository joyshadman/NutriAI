# 0002. Data model · rationale

**Date**: 2026-11-11

## Context

The scope's third feature is the core entities every later slice builds on: users, meals, daily entries, and food items. The done when line asks that the entities and relationships support AI suggestions, goals, and history without a migration that breaks. The project is a small launch for you and friends, with privacy by default. Meals and macros are personal health data, so isolation matters even at small scale.

The existing schema already carries the Better Auth tables plus a flat `meals` table and a `goals` table. Two forces shape the decision. First, the Neon HTTP driver cannot run transactions, so the usual per request row level security pattern with a transaction level user id is unavailable. Second, Better Auth owns the `users` table and queries it without any user context, so a policy on that table would break sign in unless auth gets its own privileged connection.

A third force is the product shape. A photo estimate or an AI suggestion usually names several foods on one plate, and history should not change when a food's macros are corrected later. A single flat meal row loses that detail or silently rewrites the past. A fourth force is operational: a role created in the Neon console can inherit `neon_superuser`, which carries `BYPASSRLS`, so a role that looks separate can still ignore every policy unless the membership is revoked and checked.

## Options considered

### Option 1: Flat meals with app level ownership checks

A meal is one row with a name and macros, and the app filters every query by user id. The HTTP driver stays, and no roles or transactions are added.

**Pros**:
- Fewest moving parts, no new role, no transaction per request.
- Keeps the current `meals` table almost as it is.

**Cons**:
- One missed filter exposes another person's health data.
- The scope's row level security box is not met.
- A mixed plate is either many meals or one blended row.

### Option 2: Meals with items, a per user catalog, and policy based isolation (chosen)

Meals hold items, items snapshot their macros, foods form a catalog per user, and row level security runs through a non owner app role with the user id set per transaction.

**Pros**:
- Matches a real plate, a photo estimate with several foods, and an AI suggestion.
- History stays true when a food is edited or deleted.
- Real defense in depth, not an app level promise.
- A day total has one source of truth and no rollup to keep in sync.

**Cons**:
- More tables and one join to read a meal.
- A second connection string and a one time role setup.
- A transaction and a user id setting around every app query.
- The app role must be verified not to inherit `BYPASSRLS`, or the isolation is only on paper.

### Option 3: Daily rollup table with flat meals

A `daily_entries` row per user per day stores the totals, and every meal write updates it.

**Pros**:
- Fast day reads with no aggregation.
- A natural place to hang a streak or a summary later.

**Cons**:
- Every write path must keep the rollup correct, and drift is silent.
- The scale does not need it, and the totals are cheap to compute.

### Option 4: One owner role with forced row level security

A single connection stays, and the tables use `FORCE ROW LEVEL SECURITY` so policies apply even to the owner.

**Pros**:
- One connection string and no second role.

**Cons**:
- Migrations must bypass the force, and a mistake either breaks deploys or silently disables the policy.
- The owner can still be granted `BYPASSRLS`, which quietly undoes the protection.

## Rationale

Option 2 wins because it is the only option that satisfies all three forces at once. The item table gives photo estimates and AI suggestions a natural home, and the snapshot keeps history honest when a food changes. The separate app role is what makes row level security real on Postgres, since an owner bypasses its own policies. Setting the user id per transaction is the standard pattern and fits the WebSocket driver, which is the smallest change that buys transactions.

Option 1 is genuinely simpler, and at a tiny launch it would probably never leak. The reason to reject it is that the leak is silent and the fix later means rewriting every query and policy. Option 3 optimizes a read that is already cheap at this scale and adds a write path that can drift. Option 4 looks like one connection but moves the risk into migrations, where a mistake is harder to see.

The derived day total follows the rule that stored computed values go stale. The per user catalog follows the ownership model: every row belongs to one person, so every policy is a simple user id comparison or a lookup through the parent meal. The duplicate rule is an expression unique index rather than a normalized column, so the catalog keeps the display case the user typed.

Two costs are accepted on purpose. Better Auth tables stay outside RLS, because forcing a context on sign in would break the auth flow for little gain; app code still filters by the session user. And `meal_items` resolves ownership through a subquery instead of a copied user id, which is slightly slower but leaves no second column to keep in agreement. Items are immutable so the snapshot never drifts, and a meal edit replaces them. The app role's `BYPASSRLS` state is asserted in the migration because a console created role can inherit it, and a policy that the app can bypass is worse than no policy, since it looks safe.
